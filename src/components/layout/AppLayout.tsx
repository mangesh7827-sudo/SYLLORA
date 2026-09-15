import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/icons/Icon';
import { useTheme } from '@/app/providers/ThemeContext';
import { useAuth } from '@/app/providers/AuthContext';
import { routePaths } from '@/app/routes/routePaths';
import { Fade } from '@/components/motion';
import { useStudyTimer } from '@/features/productivity/hooks/useStudyTimer';
import { formatDuration } from '@/features/productivity/utils/time';
import { NotificationCenter } from '@/features/phase10/components/NotificationCenter';
import { notificationsService } from '@/features/phase10/services/api';

interface NavigationItem { label: string; to: string; icon: IconName; end?: boolean }
interface NavigationGroup { label: string; items: NavigationItem[] }

const groups: NavigationGroup[] = [
  { label: 'Main', items: [{ label: 'Dashboard', to: routePaths.dashboard, icon: 'dashboard', end: true }] },
  { label: 'Academics', items: [
    { label: 'Subjects', to: routePaths.subjects, icon: 'academic' },
    { label: 'Assignments', to: routePaths.assignments, icon: 'clipboard' },
    { label: 'Experiments', to: routePaths.experiments, icon: 'flask' },
    { label: 'Projects', to: routePaths.projects, icon: 'folder' },
  ] },
  { label: 'Productivity', items: [
    { label: 'Study Tracker', to: routePaths.study, icon: 'book' },
    { label: 'Stopwatch', to: routePaths.stopwatch, icon: 'stopwatch' },
    { label: 'Revision', to: routePaths.revision, icon: 'refresh' },
    { label: 'Habits', to: routePaths.habits, icon: 'target' },
  ] },
  { label: 'Academic Records', items: [
    { label: 'Attendance', to: routePaths.attendance, icon: 'check' },
    { label: 'Timetable', to: routePaths.timetable, icon: 'calendar' },
  ] },
  { label: 'Analytics', items: [{ label: 'Reports', to: routePaths.reports, icon: 'chart' }] },
  { label: 'System', items: [{ label: 'Settings', to: routePaths.settings, icon: 'settings' }] },
];

function Navigation({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  return <nav className="app-nav" aria-label="Application navigation">{groups.map((group) => <div className="app-nav__group" key={group.label}><p>{group.label}</p>{group.items.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}><Icon name={item.icon} /><span>{item.label}</span></NavLink>)}</div>)}</nav>;
}

function getPageTitle(pathname: string): string {
  const item = groups.flatMap((group) => group.items).find((entry) => pathname === entry.to || (!entry.end && pathname.startsWith(`${entry.to}/`)));
  return item?.label ?? 'Syllora';
}

function ActiveStudyIndicator() {
  const { activeSession, elapsedSeconds } = useStudyTimer();
  if (!activeSession) return null;
  return <Link className="app-shell__active-study" to={routePaths.stopwatch} aria-label={`Active study session, ${formatDuration(elapsedSeconds)}`}>
    <span className="app-shell__active-study-dot" aria-hidden="true" />
    <span className="app-shell__active-study-copy"><strong>Study timer</strong><span>{formatDuration(elapsedSeconds)}</span></span>
  </Link>;
}

function UserAvatar({ nickname }: { nickname: string }) {
  const initials = nickname.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
  return <span className="app-shell__avatar" aria-hidden="true">{initials}</span>;
}

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobile = () => setMobileOpen(false);
  const nickname = currentUser?.nickname?.trim() || currentUser?.displayName || 'Syllora User';

  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  useEffect(() => {
    let active = true;
    const loadUnread = () => notificationsService.list(true).then(items => { if (active) setUnreadNotifications(items.length); }).catch(() => undefined);
    void loadUnread();
    const timer = window.setInterval(loadUnread, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelector<HTMLElement>('a, button');
    focusable?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeMobile(); return; }
      if (event.key !== 'Tab' || !drawer) return;
      const elements = Array.from(drawer.querySelectorAll<HTMLElement>('a, button')).filter((element) => !element.hasAttribute('disabled'));
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (document.activeElement === document.body) mobileMenuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate(routePaths.login, { replace: true });
  };

  return <div className={`app-shell${collapsed ? ' app-shell--collapsed' : ''}`}>
    <aside className="app-shell__sidebar" aria-label="Primary navigation">
      <div className="app-shell__brand"><span className="app-shell__brand-mark">S</span><span>Syllora</span></div>
      <Navigation collapsed={collapsed} />
      <div className="app-shell__account">
        <UserAvatar nickname={nickname} /><div className="app-shell__account-copy"><strong>{nickname}</strong><span>Account</span></div>
        <Button variant="ghost" size="sm" className="app-shell__logout" onClick={() => void handleLogout()} aria-label="Log out"><Icon name="logout" /></Button>
      </div>
    </aside>

    {mobileOpen && <div className="app-shell__backdrop" aria-hidden="true" onClick={closeMobile} />}
    <aside ref={drawerRef} className={`app-shell__mobile-drawer${mobileOpen ? ' is-open' : ''}`} role="dialog" aria-label="Mobile navigation" aria-modal="true">
      <div className="app-shell__mobile-header"><div className="app-shell__brand"><span className="app-shell__brand-mark">S</span><span>Syllora</span></div><Button variant="icon" size="sm" onClick={closeMobile} aria-label="Close navigation"><Icon name="close" /></Button></div>
      <Navigation onNavigate={closeMobile} />
      <div className="app-shell__mobile-account"><UserAvatar nickname={nickname} /><div><strong>{nickname}</strong><span>Account</span></div></div>
    </aside>

    <nav className="app-shell__mobile-bottom" aria-label="Mobile primary navigation">{[{label:'Home',to:routePaths.dashboard,icon:'dashboard' as IconName},{label:'Academics',to:routePaths.subjects,icon:'academic' as IconName},{label:'Study',to:routePaths.study,icon:'book' as IconName},{label:'Attendance',to:routePaths.attendance,icon:'check' as IconName},{label:'More',to:routePaths.reports,icon:'chart' as IconName}].map(item=><NavLink key={item.to} to={item.to}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}</nav>

    <div className="app-shell__content">
      <header className="app-shell__topbar">
        <div className="app-shell__topbar-left"><Button ref={mobileMenuButtonRef} variant="icon" size="sm" className="app-shell__mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Icon name="menu" /></Button><Button variant="icon" size="sm" className="app-shell__collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}><Icon name="panel" /></Button><div><p className="app-shell__breadcrumb">Syllora</p><h1>{getPageTitle(location.pathname)}</h1></div></div>
        <div className="app-shell__actions"><ActiveStudyIndicator />
          <div className="app-shell__notification-wrap"><Button variant="icon" size="sm" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ''}`} onClick={() => setNotificationsOpen(value => !value)}><Icon name="bell" />{unreadNotifications > 0 && <span className="app-shell__notification-count" aria-hidden="true">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}</Button><NotificationCenter open={notificationsOpen} onClose={() => { setNotificationsOpen(false); setUnreadNotifications(0); }} /></div>
          <Button className="app-shell__theme-toggle" variant="ghost" size="sm" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><Icon name={theme === 'light' ? 'moon' : 'sun'} /><span>{theme === 'light' ? 'Dark' : 'Light'}</span></Button>
          <div className="app-shell__topbar-user"><UserAvatar nickname={nickname} /><span>{nickname}</span></div>
        </div>
      </header>
      <main className="app-shell__main"><Fade duration="fast"><Outlet /></Fade></main>
    </div>
  </div>;
}
