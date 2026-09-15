import { existsSync, readFileSync } from 'node:fs';
const required = [
  'src/styles/tokens/index.css','src/styles/themes/light.css','src/styles/themes/dark.css',
  'src/components/ui/Button.tsx','src/components/ui/Card.tsx','src/components/ui/Input.tsx',
  'src/components/ui/Select.tsx','src/components/ui/Textarea.tsx','src/components/ui/Tabs.tsx',
  'src/components/ui/Badge.tsx','src/components/ui/Progress.tsx','src/components/ui/Checkbox.tsx',
  'src/components/ui/Radio.tsx','src/components/ui/Toggle.tsx','src/components/ui/Tooltip.tsx',
  'src/components/ui/DesignSystemShowcase.tsx'
];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) { console.error('FAIL missing files:', missing.join(', ')); process.exit(1); }
const css = readFileSync('src/styles/global/components.css','utf8');
const global = readFileSync('src/styles/global/index.css','utf8');
const tokens = readFileSync('src/styles/tokens/index.css','utf8');
const tabs = readFileSync('src/components/ui/Tabs.tsx','utf8');
const checks = [
  ['semantic status text token', css.includes('var(--color-text-on-status)')],
  ['keyboard focus styles', css.includes(':focus-visible')],
  ['reduced motion', global.includes('prefers-reduced-motion')],
  ['circular progress', css.includes('.ui-progress-circle')],
  ['responsive rules', global.includes('@media (max-width: 720px)')],
  ['semantic typography roles', tokens.includes('--type-display') && tokens.includes('--type-navigation')],
  ['tabs panel relationship', tabs.includes('aria-controls') && tabs.includes('role="tabpanel"')],
  ['tabs keyboard navigation', tabs.includes('ArrowRight') && tabs.includes('Home') && tabs.includes('End')],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log('PASS Phase 2 static audit');
