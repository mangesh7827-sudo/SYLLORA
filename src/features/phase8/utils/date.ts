export const MS_DAY = 86_400_000;
export function localDateKey(date = new Date()): string { const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
export function startOfLocalDay(date = new Date()): Date { const d=new Date(date); d.setHours(0,0,0,0); return d; }
export function endOfLocalDay(date = new Date()): Date { const d=startOfLocalDay(date); d.setHours(23,59,59,999); return d; }
export function parseTime(value:string): number { const [h,m]=value.split(':').map(Number); return h*60+m; }
export function isValidTimeRange(start:string,end:string): boolean { return /^([01]\d|2[0-3]):[0-5]\d$/.test(start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(end) && parseTime(end)>parseTime(start); }
export function formatTime(value:string): string { const [h,m]=value.split(':').map(Number); const suffix=h>=12?'PM':'AM'; const hour=h%12||12; return `${hour}:${String(m).padStart(2,'0')} ${suffix}`; }
export function formatDate(value:string): string { return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${value}T00:00:00`)); }
export function daysFromToday(value:string,date=new Date()): number { return Math.round((new Date(`${value}T00:00:00`).getTime()-startOfLocalDay(date).getTime())/MS_DAY); }
export function isDateInRange(value:string,from:string,to:string):boolean { return value>=from && value<=to; }
export function dayOfWeekMondayFirst(date=new Date()):number { return (date.getDay()+6)%7; }
export function todayDayNumber(date=new Date()):number { return date.getDay(); }
