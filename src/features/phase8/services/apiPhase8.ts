import type {
  AttendanceRecord,
  AttendanceSettings,
  Assignment,
  Experiment,
  ExtraLecture,
  Habit,
  HabitRecord,
  TimetableEntry,
} from '@/types';

import type {
  AttendanceService,
  TimetableService,
  AssignmentService,
  ExperimentService,
  HabitService,
  AttendanceRecordInput,
  TimetableInput,
  ExtraLectureInput,
  AssignmentInput,
  ExperimentInput,
  HabitInput,
  AttendanceSummary,
  OverallAttendanceSummary,
} from '../types';

import {
  createUserDoc,
  deleteUserDoc,
  getUserDoc,
  listUserDocs,
  updateUserDoc,
} from '@/services/firebase/db';

import {
  calculateAttendancePercentage,
  calculateAttendanceStatus,
  calculateRequiredAttendanceProjection,
  calculateAssignmentSummary,
  calculateExperimentProgress,
  calculateHabitStreak,
} from '../utils/calculations';

import { localDateKey } from '@/features/productivity/utils/time';

const now = () => new Date().toISOString();

const clean = (v?: string) => v?.trim() || undefined;

const list = <T extends object>(
  uid: string,
  name: string
): Promise<T[]> => listUserDocs<T>(uid, name);

/* =========================================================
   ATTENDANCE
   ========================================================= */

export const createApiAttendanceService = (): AttendanceService => ({
  async getRecords(uid) {
    return (await list<AttendanceRecord>(uid, 'attendance')).sort(
      (a, b) => b.date.localeCompare(a.date)
    );
  },

  async createRecord(uid, input: AttendanceRecordInput) {
    const t = now();

    return createUserDoc<AttendanceRecord>(
      uid,
      'attendance',
      {
        userId: uid,
        ...input,
        lectureTitle: clean(input.lectureTitle),
        lectureId: input.lectureId,
        createdAt: t,
        updatedAt: t,
      } as Omit<AttendanceRecord, 'id'>
    );
  },

  async updateRecord(uid, id, input) {
    return updateUserDoc<AttendanceRecord>(
      uid,
      'attendance',
      id,
      {
        ...input,
        lectureTitle: clean(input.lectureTitle),
        updatedAt: now(),
      }
    );
  },

  async deleteRecord(uid, id) {
    await deleteUserDoc(uid, 'attendance', id);
  },

  async getSettings(uid) {
    return list<AttendanceSettings>(
      uid,
      'attendanceSettings'
    );
  },

  async setRequiredPercentage(
    uid,
    subjectId,
    requiredPercentage
  ) {
    if (
      !Number.isFinite(requiredPercentage) ||
      requiredPercentage < 0 ||
      requiredPercentage > 100
    ) {
      throw new Error(
        'Attendance target must be between 0 and 100.'
      );
    }

    const existing = (
      await list<AttendanceSettings>(
        uid,
        'attendanceSettings'
      )
    ).find(
      (x) => x.subjectId === subjectId
    );

    const t = now();

    if (existing) {
      return updateUserDoc<AttendanceSettings>(
        uid,
        'attendanceSettings',
        existing.id,
        {
          requiredPercentage,
          updatedAt: t,
        }
      );
    }

    return createUserDoc<AttendanceSettings>(
      uid,
      'attendanceSettings',
      {
        userId: uid,
        subjectId,
        requiredPercentage,
        createdAt: t,
        updatedAt: t,
      } as Omit<AttendanceSettings, 'id'>
    );
  },

  async getSummary(uid, subjectId) {
    const [records, settings] = await Promise.all([
      this.getRecords(uid),
      this.getSettings(uid),
    ]);

    return calculateAttendanceSummaryLocal(
      subjectId,
      records,
      settings.find(
        (x) => x.subjectId === subjectId
      )?.requiredPercentage ?? 75
    );
  },

  async getOverallSummary(uid) {
    return calculateOverall(
      await this.getRecords(uid)
    );
  },

  async getDateSummary(uid, from, to) {
    const [records, settings] = await Promise.all([
      this.getRecords(uid),
      this.getSettings(uid),
    ]);

    const filtered = records.filter(
      (r) => r.date >= from && r.date <= to
    );

    const subjects = [
      ...new Set(
        filtered.map((r) => r.subjectId)
      ),
    ];

    const bySubject = subjects.map(
      (id) =>
        calculateAttendanceSummaryLocal(
          id,
          filtered,
          settings.find(
            (x) => x.subjectId === id
          )?.requiredPercentage ?? 75
        )
    );

    const overall = calculateOverall(filtered);

    return {
      from,
      to,
      total: overall.total,
      present: overall.present,
      absent: overall.absent,
      percentage: overall.percentage,
      bySubject,
    };
  },

  async adjustCount(
    uid,
    subjectId,
    status,
    delta
  ) {
    if (delta !== 1 && delta !== -1) {
      throw new Error(
        'Invalid attendance adjustment.'
      );
    }

    const records = await this.getRecords(uid);

    if (delta === -1) {
      const target = records.find(
        (r) =>
          r.subjectId === subjectId &&
          r.status === status
      );

      if (!target) {
        throw new Error(
          `No ${status} attendance record is available to remove.`
        );
      }

      await deleteUserDoc(
        uid,
        'attendance',
        target.id
      );
    } else {
      const t = localDateKey(new Date());

      await createUserDoc<AttendanceRecord>(
        uid,
        'attendance',
        {
          userId: uid,
          subjectId,
          date: t,
          status,
          createdAt: now(),
          updatedAt: now(),
        } as Omit<AttendanceRecord, 'id'>
      );
    }

    return this.getSummary(
      uid,
      subjectId
    );
  },
});

function calculateAttendanceSummaryLocal(
  subjectId: string,
  records: AttendanceRecord[],
  required: number
): AttendanceSummary {
  const r = records.filter(
    (x) => x.subjectId === subjectId
  );

  const present = r.filter(
    (x) => x.status === 'present'
  ).length;

  const absent = r.length - present;

  const percentage =
    calculateAttendancePercentage(
      present,
      r.length
    );

  const projection =
    calculateRequiredAttendanceProjection(
      present,
      absent,
      required
    );

  return {
    subjectId,
    present,
    absent,
    total: r.length,
    percentage,
    requiredPercentage: required,
    status: calculateAttendanceStatus(
      percentage,
      required
    ),
    neededToReachRequired:
      projection.needed,
    canRecover:
      projection.canRecover,
  };
}

function calculateOverall(
  records: AttendanceRecord[]
): OverallAttendanceSummary {
  const present = records.filter(
    (x) => x.status === 'present'
  ).length;

  return {
    present,
    absent: records.length - present,
    total: records.length,
    percentage:
      calculateAttendancePercentage(
        present,
        records.length
      ),
  };
}

/* =========================================================
   TIMETABLE
   ========================================================= */

export const createApiTimetableService =
  (): TimetableService => ({
    async getEntries(uid) {
      return (
        await list<TimetableEntry>(
          uid,
          'timetable'
        )
      ).sort(
        (a, b) =>
          a.dayOfWeek - b.dayOfWeek ||
          a.startTime.localeCompare(
            b.startTime
          )
      );
    },

    async getExtraLectures(uid) {
      return (
        await list<ExtraLecture>(
          uid,
          'extraLectures'
        )
      ).sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(
            b.startTime
          )
      );
    },

    async createEntry(
      uid,
      input: TimetableInput
    ) {
      if (
        input.dayOfWeek < 0 ||
        input.dayOfWeek > 6
      ) {
        throw new Error(
          'Select a valid day.'
        );
      }

      const t = now();

      return createUserDoc<TimetableEntry>(
        uid,
        'timetable',
        {
          userId: uid,
          ...input,
          room: clean(input.room),
          professor: clean(input.professor),
          batch: clean(input.batch),
          createdAt: t,
          updatedAt: t,
        } as Omit<TimetableEntry, 'id'>
      );
    },

    async updateEntry(
      uid,
      id,
      input
    ) {
      return updateUserDoc<TimetableEntry>(
        uid,
        'timetable',
        id,
        {
          ...input,
          room: clean(input.room),
          professor: clean(input.professor),
          batch: clean(input.batch),
          updatedAt: now(),
        }
      );
    },

    async deleteEntry(uid, id) {
      await deleteUserDoc(
        uid,
        'timetable',
        id
      );
    },

    async createExtraLecture(
      uid,
      input: ExtraLectureInput
    ) {
      const t = now();

      return createUserDoc<ExtraLecture>(
        uid,
        'extraLectures',
        {
          userId: uid,
          ...input,
          room: clean(input.room),
          professor: clean(input.professor),
          batch: clean(input.batch),
          type: 'EXTRA',
          createdAt: t,
          updatedAt: t,
        } as Omit<ExtraLecture, 'id'>
      );
    },

    async updateExtraLecture(
      uid,
      id,
      input
    ) {
      return updateUserDoc<ExtraLecture>(
        uid,
        'extraLectures',
        id,
        {
          ...input,
          room: clean(input.room),
          professor: clean(input.professor),
          batch: clean(input.batch),
          updatedAt: now(),
        }
      );
    },

    async deleteExtraLecture(
      uid,
      id
    ) {
      await deleteUserDoc(
        uid,
        'extraLectures',
        id
      );
    },

    async getToday(
      uid,
      date = new Date()
    ) {
      const day = date.getDay();

      const [entries, extras] =
        await Promise.all([
          this.getEntries(uid),
          this.getExtraLectures(uid),
        ]);

      const dateKey =
        localDateKey(date);

      return [
        ...entries.filter(
          (e) => e.dayOfWeek === day
        ),
        ...extras.filter(
          (e) => e.date === dateKey
        ),
      ].sort(
        (a, b) =>
          a.startTime.localeCompare(
            b.startTime
          )
      );
    },
  });

/* =========================================================
   ASSIGNMENTS
   ========================================================= */

export const createApiAssignmentService =
  (): AssignmentService => ({
    async getAssignments(uid) {
      return (
        await list<Assignment>(
          uid,
          'assignments'
        )
      ).sort(
        (a, b) =>
          a.dueDate.localeCompare(
            b.dueDate
          )
      );
    },

    async createAssignment(
      uid,
      input: AssignmentInput
    ) {
      if (!input.title.trim()) {
        throw new Error(
          'Assignment title is required.'
        );
      }

      const t = now();

      return createUserDoc<Assignment>(
        uid,
        'assignments',
        {
          userId: uid,
          ...input,
          title: input.title.trim(),
          description: clean(
            input.description
          ),
          notes: clean(input.notes),
          status:
            input.status ?? 'PENDING',
          dueDate: input.dueDate,
          createdAt: t,
          updatedAt: t,
        } as Omit<Assignment, 'id'>
      );
    },

    async updateAssignment(
      uid,
      id,
      input
    ) {
      const old =
        await getUserDoc<Assignment>(
          uid,
          'assignments',
          id
        );

      if (!old) {
        throw new Error(
          'Assignment not found.'
        );
      }

      return updateUserDoc<Assignment>(
        uid,
        'assignments',
        id,
        {
          ...input,
          title: input.title.trim(),
          description: clean(
            input.description
          ),
          notes: clean(input.notes),
          updatedAt: now(),
        }
      );
    },

    async deleteAssignment(
      uid,
      id
    ) {
      await deleteUserDoc(
        uid,
        'assignments',
        id
      );
    },

    async setStatus(
      uid,
      id,
      status
    ) {
      const old =
        await getUserDoc<Assignment>(
          uid,
          'assignments',
          id
        );

      if (!old) {
        throw new Error(
          'Assignment not found.'
        );
      }

      return updateUserDoc<Assignment>(
        uid,
        'assignments',
        id,
        {
          status,
          completedAt:
            status === 'COMPLETED'
              ? old.completedAt ??
                now()
              : undefined,
          updatedAt: now(),
        }
      );
    },

    async getSummary(
      uid,
      at = new Date()
    ) {
      return calculateAssignmentSummary(
        await this.getAssignments(uid),
        at
      );
    },
  });

/* =========================================================
   EXPERIMENTS
   ========================================================= */

export const createApiExperimentService =
  (): ExperimentService => ({
    async getExperiments(uid) {
      return (
        await list<Experiment>(
          uid,
          'experiments'
        )
      ).sort(
        (a, b) =>
          a.experimentNumber -
          b.experimentNumber
      );
    },

    async createExperiment(
      uid,
      input: ExperimentInput
    ) {
      const t = now();

      const completion =
        input.completionStatus ??
        'PENDING';

      const checked =
        input.checkedStatus ??
        'NOT_CHECKED';

      if (
        checked === 'CHECKED' &&
        completion !== 'COMPLETED'
      ) {
        throw new Error(
          'An experiment must be completed before it can be checked.'
        );
      }

      return createUserDoc<Experiment>(
        uid,
        'experiments',
        {
          userId: uid,
          ...input,
          name: input.name.trim(),
          description: clean(
            input.description
          ),
          completionStatus: completion,
          checkedStatus: checked,
          completedAt:
            completion === 'COMPLETED'
              ? t
              : undefined,
          checkedAt:
            checked === 'CHECKED'
              ? t
              : undefined,
          createdAt: t,
          updatedAt: t,
        } as Omit<Experiment, 'id'>
      );
    },

    async updateExperiment(
      uid,
      id,
      input
    ) {
      const old =
        await getUserDoc<Experiment>(
          uid,
          'experiments',
          id
        );

      if (!old) {
        throw new Error(
          'Experiment not found.'
        );
      }

      const completion =
        input.completionStatus ??
        old.completionStatus;

      const checked =
        input.checkedStatus ??
        old.checkedStatus;

      if (
        checked === 'CHECKED' &&
        completion !== 'COMPLETED'
      ) {
        throw new Error(
          'An experiment must be completed before it can be checked.'
        );
      }

      return updateUserDoc<Experiment>(
        uid,
        'experiments',
        id,
        {
          ...input,
          name: input.name.trim(),
          description: clean(
            input.description
          ),
          completionStatus: completion,
          checkedStatus: checked,
          completedAt:
            completion === 'COMPLETED'
              ? old.completedAt ??
                now()
              : undefined,
          checkedAt:
            checked === 'CHECKED'
              ? old.checkedAt ??
                now()
              : undefined,
          updatedAt: now(),
        }
      );
    },

    async deleteExperiment(
      uid,
      id
    ) {
      await deleteUserDoc(
        uid,
        'experiments',
        id
      );
    },

    async getProgress(uid) {
      return calculateExperimentProgress(
        await this.getExperiments(uid)
      );
    },
  });

/* =========================================================
   HABITS
   ========================================================= */

export const createApiHabitService =
  (): HabitService => ({
    async getHabits(uid) {
      return (
        await list<Habit>(
          uid,
          'habits'
        )
      )
        .filter((h) => h.active)
        .sort(
          (a, b) =>
            a.createdAt.localeCompare(
              b.createdAt
            )
        );
    },

    async createHabit(
      uid,
      input: HabitInput
    ) {
      const t = now();

      return createUserDoc<Habit>(
        uid,
        'habits',
        {
          userId: uid,
          ...input,
          name: input.name.trim(),
          description: clean(
            input.description
          ),
          active:
            input.active ?? true,
          createdAt: t,
          updatedAt: t,
        } as Omit<Habit, 'id'>
      );
    },

    async updateHabit(
      uid,
      id,
      input
    ) {
      return updateUserDoc<Habit>(
        uid,
        'habits',
        id,
        {
          ...input,
          name: input.name.trim(),
          description: clean(
            input.description
          ),
          active: input.active,
          updatedAt: now(),
        }
      );
    },

    async deleteHabit(
      uid,
      id
    ) {
      await deleteUserDoc(
        uid,
        'habits',
        id
      );

      const records =
        await list<HabitRecord>(
          uid,
          'habitRecords'
        );

      await Promise.all(
        records
          .filter(
            (r) => r.habitId === id
          )
          .map((r) =>
            deleteUserDoc(
              uid,
              'habitRecords',
              r.id
            )
          )
      );
    },

    async setActive(
      uid,
      id,
      active
    ) {
      return updateUserDoc<Habit>(
        uid,
        'habits',
        id,
        {
          active,
          updatedAt: now(),
        }
      );
    },

    async getRecords(
      uid,
      from,
      to
    ) {
      return (
        await list<HabitRecord>(
          uid,
          'habitRecords'
        )
      )
        .filter(
          (r) =>
            (!from || r.date >= from) &&
            (!to || r.date <= to)
        )
        .sort(
          (a, b) =>
            b.date.localeCompare(
              a.date
            )
        );
    },

    async toggleToday(
      uid,
      habitId,
      date = new Date()
    ) {
      if (
        !await getUserDoc<Habit>(
          uid,
          'habits',
          habitId
        )
      ) {
        throw new Error(
          'Habit not found.'
        );
      }

      const key =
        localDateKey(date);

      const records =
        await this.getRecords(uid);

      const existing =
        records.find(
          (r) =>
            r.habitId === habitId &&
            r.date === key
        );

      if (existing) {
        await deleteUserDoc(
          uid,
          'habitRecords',
          existing.id
        );

        return existing;
      }

      const t = now();

      return createUserDoc<HabitRecord>(
        uid,
        'habitRecords',
        {
          userId: uid,
          habitId,
          date: key,
          completed: true,
          createdAt: t,
          updatedAt: t,
        } as Omit<HabitRecord, 'id'>
      );
    },

    async getToday(
      uid,
      date = new Date()
    ) {
      const habits =
        await list<Habit>(
          uid,
          'habits'
        );

      const records =
        await this.getRecords(uid);

      return habits
        .filter(
          (h) => h.active
        )
        .map((h) => {
          const record =
            records.find(
              (r) =>
                r.habitId === h.id &&
                r.date ===
                  localDateKey(date)
            ) ?? null;

          return {
            habit: h,
            record,
            streak:
              calculateHabitStreak(
                records.filter(
                  (r) =>
                    r.habitId === h.id
                ),
                date
              ),
          };
        });
    },

    async getStreak(
      uid,
      habitId,
      date = new Date()
    ) {
      return calculateHabitStreak(
        (
          await this.getRecords(uid)
        ).filter(
          (r) =>
            r.habitId === habitId
        ),
        date
      );
    },
  });