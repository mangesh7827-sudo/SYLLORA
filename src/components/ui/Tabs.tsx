import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export type Tab = { id: string; label: string; disabled?: boolean };
type TabsProps = { tabs: Tab[]; value: string; onChange: (id: string) => void; 'aria-label'?: string; idPrefix?: string };
type TabPanelProps = { tabId: string; activeTab: string; children: ReactNode; className?: string; idPrefix?: string };

export function Tabs({ tabs, value, onChange, 'aria-label': ariaLabel = 'Section tabs', idPrefix = 'syllora-tabs' }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusTab = (index: number) => tabRefs.current[index]?.focus();
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = tabs.map((tab, i) => ({ tab, i })).filter(({ tab }) => !tab.disabled).map(({ i }) => i);
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key) || enabled.length === 0) return;
    event.preventDefault();
    const current = enabled.indexOf(index);
    const next = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1)! : enabled[(current + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length];
    focusTab(next);
    onChange(tabs[next].id);
  };
  return <div className="ui-tabs" role="tablist" aria-label={ariaLabel}>
    {tabs.map((tab, index) => {
      const selected = value === tab.id;
      const tabId = `${idPrefix}-tab-${tab.id}`;
      const panelId = `${idPrefix}-panel-${tab.id}`;
      return <button key={tab.id} ref={(node) => { tabRefs.current[index] = node; }} id={tabId} type="button" role="tab" aria-selected={selected} aria-controls={panelId} tabIndex={selected ? 0 : -1} disabled={tab.disabled} className={`ui-tab ${selected ? 'is-active' : ''}`} onClick={() => onChange(tab.id)} onKeyDown={(event) => onKeyDown(event, index)}>{tab.label}</button>;
    })}
  </div>;
}

export function TabPanel({ tabId, activeTab, children, className = '', idPrefix = 'syllora-tabs' }: TabPanelProps) {
  const panelId = `${idPrefix}-panel-${tabId}`;
  return <div id={panelId} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${tabId}`} hidden={activeTab !== tabId} tabIndex={0} className={`ui-tabpanel ${className}`.trim()}>{children}</div>;
}
