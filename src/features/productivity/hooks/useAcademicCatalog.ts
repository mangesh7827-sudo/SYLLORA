import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { academicService } from '@/features/academics/services/academicService';
import type { ModuleSummary, SubjectSummary } from '@/features/academics/types/academic';
import type { Topic } from '@/types';

export function useAcademicCatalog() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? '';
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) { setSubjects([]); setModules([]); setTopics([]); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const nextSubjects = await academicService.getSubjects(userId);
      const moduleLists = await Promise.all(nextSubjects.map((subject) => academicService.getModules(userId, subject.id)));
      const nextModules = moduleLists.flat();
      const topicLists = await Promise.all(nextModules.map((module) => academicService.getTopics(userId, module.id)));
      setSubjects(nextSubjects); setModules(nextModules); setTopics(topicLists.flat());
    } catch { setError('Unable to load your academic targets.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);
  return { userId, subjects, modules, topics, loading, error, refresh: load };
}
