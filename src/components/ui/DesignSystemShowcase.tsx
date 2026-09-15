import { useState } from 'react';
import { useTheme } from '@/app/providers/ThemeContext';
import { Icon } from '@/components/icons/Icon';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Divider } from './Divider';
import { Fade, Floating, HoverLift, PressEffect, Scale, Slide } from '@/components/motion';
import { Input } from './Input';
import { Progress } from './Progress';
import { Radio } from './Radio';
import { Select } from './Select';
import { TabPanel, Tabs } from './Tabs';
import { Toggle } from './Toggle';
import { Textarea } from './Textarea';

const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'activity', label: 'Activity' }, { id: 'disabled', label: 'Disabled', disabled: true }];

export function DesignSystemShowcase() {
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('overview');
  return <main className="showcase">
    <div className="showcase__header">
      <div><p className="showcase__eyebrow">Syllora design system</p><h1>Visual foundation</h1><p className="showcase__lead">The reusable visual language for every future Syllora module.</p></div>
      <Button variant="secondary" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}><Icon name={theme === 'light' ? 'moon' : 'sun'} /> {theme === 'light' ? 'Dark' : 'Light'} theme</Button>
    </div>

    <section className="showcase__section"><h2>Colors</h2><div className="token-grid">
      {['background','surface','surface-subtle','surface-elevated','surface-interactive','primary','primary-subtle','success','warning','danger','info'].map((name) => <div className="color-token" key={name}><span className={`color-token__swatch color-token__swatch--${name}`} /><div><strong>{name}</strong><small>semantic token</small></div></div>)}
    </div></section>

    <section className="showcase__section"><h2>Typography</h2><div className="type-stack"><span className="type-display">Display</span><h1>Heading one</h1><h2>Heading two</h2><h3>Heading three</h3><h4>Heading four</h4><p className="type-body-large">Body large — clear hierarchy for important context.</p><p className="type-body">Body — the default reading size for Syllora.</p><p className="type-body-small">Body small — supporting information.</p><span className="type-label">LABEL</span><span className="type-caption">CAPTION</span><span className="type-button">BUTTON</span><span className="type-navigation">NAVIGATION</span></div></section>

    <section className="showcase__section"><h2>Buttons</h2><div className="showcase__row">{(['primary','secondary','outline','ghost','danger','success'] as const).map(v => <Button key={v} variant={v}>{v}</Button>)}<Button variant="icon" aria-label="Search"><Icon name="search" /></Button></div></section>

    <section className="showcase__section"><h2>Cards & surfaces</h2><div className="showcase__cards">{(['default','elevated','interactive','compact','highlighted'] as const).map(v => <Card key={v} variant={v}><strong>{v}</strong><p>Reusable surface hierarchy.</p></Card>)}</div></section>

    <section className="showcase__section"><h2>Inputs</h2><div className="showcase__form"><Input label="Subject name" placeholder="e.g. Mathematics" /><Input label="Success state" value="Mathematics" readOnly success="Looks good." /><Input label="Error state" value="Invalid value" readOnly error="Please enter a valid value." /><Input label="Disabled state" value="Unavailable" disabled /><Select label="Status" defaultValue="pending"><option value="pending">Pending</option><option value="done">Completed</option></Select><Textarea label="Notes" placeholder="Add notes" /><Checkbox label="Remember preference" defaultChecked /><Radio name="example" label="Option A" defaultChecked /><Toggle label="Enable notifications" defaultChecked /></div></section>

    <section className="showcase__section"><h2>Tabs & status</h2><Tabs tabs={tabs} value={tab} onChange={setTab} idPrefix="showcase-tabs" /><TabPanel tabId="overview" activeTab={tab} idPrefix="showcase-tabs"><p>Overview tab content.</p></TabPanel><TabPanel tabId="activity" activeTab={tab} idPrefix="showcase-tabs"><p>Activity tab content.</p></TabPanel><div className="showcase__row"><Badge status="completed">Completed</Badge><Badge status="pending">Pending</Badge><Badge status="in-progress">In Progress</Badge><Badge status="present">Present</Badge><Badge status="absent">Absent</Badge><Badge status="due-soon">Due Soon</Badge><Badge status="overdue">Overdue</Badge><Badge status="at-risk">At Risk</Badge></div></section>

    <section className="showcase__section"><h2>Progress</h2><Progress value={68} label="Module progress" /><Progress value={32} label="Study progress" size="sm" /><Progress value={82} label="Circular progress" variant="circular" /></section>

    <section className="showcase__section"><h2>Elevation & interaction</h2><div className="elevation-grid">{['none','subtle','md','lg','floating'].map(v => <div key={v} className={`elevation elevation--${v}`}><strong>{v}</strong><span>Surface</span></div>)}</div></section>
    <section className="showcase__section"><h2>Phase 3 motion system</h2><p className="motion-demo-note">Motion is intentionally restrained: depth communicates interaction and hierarchy rather than decoration.</p>
      <div className="motion-demo-stack">
        <div className="motion-demo-grid">
          <HoverLift className="motion-demo-surface"><span>Hover lift</span></HoverLift>
          <PressEffect className="motion-demo-surface"><span>Press feedback</span></PressEffect>
          <Floating className="motion-demo-surface motion-demo-surface--floating"><span>Subtle floating</span></Floating>
        </div>
        <div className="motion-demo-grid">
          <Fade className="motion-demo-surface"><span>Fade</span></Fade>
          <Slide direction="up" className="motion-demo-surface"><span>Slide</span></Slide>
          <Scale className="motion-demo-surface"><span>Scale</span></Scale>
        </div>
      </div>
    </section>

    <section className="showcase__section"><h2>Motion-ready overlays</h2><div className="motion-demo-grid">
      <div className="motion-demo-surface ui-motion-overlay"><span>Overlay fade</span></div>
      <div className="motion-demo-surface ui-motion-modal"><span>Modal settle</span></div>
      <div className="motion-demo-surface ui-motion-popover"><span>Popover enter</span></div>
    </div></section>

    <section className="showcase__section"><h2>Reduced motion</h2><div className="motion-reduced-note">Syllora respects <code>prefers-reduced-motion: reduce</code>. Continuous floating and decorative movement stop, while focus, selection, and interaction states remain clear.</div></section>

    <Divider />
    <p className="showcase__footer">Current theme: <strong>{theme}</strong>. Theme choice persists across reloads.</p>
  </main>;
}
