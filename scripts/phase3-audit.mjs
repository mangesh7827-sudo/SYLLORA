import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(join(root, relative), 'utf8');
const required = [
  'src/components/motion/HoverLift.tsx',
  'src/components/motion/PressEffect.tsx',
  'src/components/motion/Floating.tsx',
  'src/components/motion/Fade.tsx',
  'src/components/motion/Slide.tsx',
  'src/components/motion/Scale.tsx',
  'src/components/motion/PageTransition.tsx',
  'src/components/motion/index.ts',
];

let failed = false;
const check = (label, condition) => {
  if (condition) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}`); failed = true; }
};

for (const file of required) check(`required motion file: ${file}`, existsSync(join(root, file)));

const tokens = read('src/styles/tokens/index.css');
const css = read('src/styles/global/components.css');
const card = read('src/components/ui/Card.tsx');
const tabs = read('src/components/ui/Tabs.tsx');
const routes = read('src/app/routes/AppRoutes.tsx');
const showcase = read('src/components/ui/DesignSystemShowcase.tsx');

for (const token of ['--duration-fast', '--duration-normal', '--duration-slow', '--ease-standard', '--ease-emphasized', '--ease-decelerate', '--ease-accelerate', '--depth-none', '--depth-subtle', '--depth-medium', '--depth-high']) {
  check(`motion token ${token}`, tokens.includes(token));
}
check('button depth interaction', css.includes('.ui-button:hover:not(:disabled)') && css.includes('.ui-button:active:not(:disabled)'));
check('card interactive depth', css.includes('.ui-card--interactive:hover') && css.includes('.ui-card--interactive:active'));
check('floating card variant', card.includes("'floating'"));
check('tab indicator transition', css.includes('.ui-tab::after') && css.includes('transform: scaleX(1)'));
check('keyboard tabs retained', tabs.includes('ArrowRight') && tabs.includes('ArrowLeft') && tabs.includes('Home') && tabs.includes('End'));
check('reduced motion support', css.includes('@media (prefers-reduced-motion: reduce)'));
check('touch-safe hover', css.includes('@media (hover: hover) and (pointer: fine)'));
check('motion primitives exported', required.slice(0, 7).every((file) => read(file).includes('export function')));
check('page transition integrated', routes.includes('<PageTransition>'));
check('showcase demonstrates phase 3 motion', showcase.includes('HoverLift') && showcase.includes('Floating') && showcase.includes('Reduced motion'));
check('no animation of layout geometry', !/(width|height|top|left|margin|padding)\s*[^;]*animation/i.test(css));

if (failed) process.exitCode = 1;
else console.log('PASS Phase 3 static audit');
