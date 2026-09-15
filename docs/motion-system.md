# Syllora Motion System — Phase 3

Phase 3 extends the Phase 2 design system with a restrained, reusable motion layer. Motion communicates interaction, hierarchy, state change, and navigation without becoming decorative noise.

## Tokens

Motion uses centralized duration and easing tokens in `src/styles/tokens/index.css`:

- `--duration-fast`, `--duration-normal`, `--duration-slow`
- `--ease-standard`, `--ease-emphasized`, `--ease-decelerate`, `--ease-accelerate`
- `--depth-none`, `--depth-subtle`, `--depth-medium`, `--depth-high`

## Motion primitives

The reusable primitives live under `src/components/motion/`:

- `HoverLift` — pointer-device elevation without touch dependency.
- `PressEffect` — immediate pressed-depth feedback.
- `Floating` — restrained continuous floating for selected surfaces only.
- `Fade` — short opacity entrance.
- `Slide` — short directional entrance using transforms.
- `Scale` — subtle scale entrance.
- `PageTransition` — lightweight route-entry transition.

The existing `Button`, `Card`, `Tabs`, `Toggle`, and `Progress` components were extended rather than duplicated.

## Responsive behavior

Pointer-dependent hover behavior is scoped to `(hover: hover) and (pointer: fine)`. Touch devices therefore rely on active/press feedback instead of hover discovery. Continuous card tilt was intentionally not implemented because the benefit is low relative to pointer tracking cost and readability risk.

## Accessibility

Motion is never the only state indicator. Focus indicators remain visible, keyboard tab behavior is preserved, and `prefers-reduced-motion: reduce` disables decorative animation and collapses transitions to near-zero duration.

## Performance

The system favors CSS `transform` and `opacity`, avoids layout-property animation, and does not use per-pointer React state or JavaScript animation loops. No animation dependency was added in Phase 3.

## Future use

Later phases should consume these primitives and the updated base components. Business logic must remain outside the motion layer.
