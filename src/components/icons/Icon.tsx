import type { ReactElement, SVGProps } from 'react';

export type IconName = 'sun' | 'moon' | 'check' | 'alert' | 'info' | 'search' | 'chevron' | 'dashboard' | 'academic' | 'clipboard' | 'flask' | 'folder' | 'book' | 'stopwatch' | 'refresh' | 'target' | 'calendar' | 'chart' | 'settings' | 'bell' | 'menu' | 'close' | 'logout' | 'panel' | 'plus' | 'clock' | 'trash' | 'download';

type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

const paths: Record<IconName, ReactElement> = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
  moon: <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a6.7 6.7 0 1 0 9.8 9.8Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  alert: <><path d="M10.3 3.2 2.6 17a2 2 0 0 0 1.75 3h15.3a2 2 0 0 0 1.75-3L13.7 3.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 16h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  academic: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.2V16c2.8 2 7.2 2 10 0v-4.8M21 10v5" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M8 9h8M8 13h6" /></>,
  flask: <><path d="M9 3h6M10 3v6l-5.5 8.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3.5L14 9V3" /><path d="M8 15h8" /></>,
  folder: <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></>,
  stopwatch: <><circle cx="12" cy="13" r="8" /><path d="M12 13V9M9 3h6M12 5V3M18 7l1.5-1.5" /></>,
  refresh: <path d="M20 11a8 8 0 0 0-14.8-3L3 11m0-6v6h6M4 13a8 8 0 0 0 14.8 3L21 13m0 6v-6h-6" />,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-8M22 19H2" /></>,
  settings: <><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 1 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.7 11H3.5a2 2 0 1 1 0-4h.2a2 2 0 0 0 1.4-3.4L5 3.5a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 11.3 2h.2a2 2 0 1 1 4 0h.2a2 2 0 0 0 3.4-1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 20.3 7h.2a2 2 0 1 1 0 4h-.2a2 2 0 0 0-.9 4Z" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M14 9l3 3-3 3" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M9 7V4h6v3M6 7l1 14h10l1-14" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
};

export function Icon({ name, size = 18, strokeWidth = 1.8, ...props }: Props) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
