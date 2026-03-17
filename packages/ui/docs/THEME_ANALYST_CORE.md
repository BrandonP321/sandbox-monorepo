# Theme: Analyst Core

## Theme summary

Analyst Core is the shared `@repo/ui` theme for dark, operational interfaces that need to stay readable under dense real-world data. It is intentionally operational, not theatrical: structure, hierarchy, and state clarity matter more than visual flair.

## Theme principles

- Dark, modular, data-first surfaces are the default.
- Borders and separators carry structure before shadows do.
- Accent color is reserved for focus, selection, active controls, and key emphasis.
- Density should feel calm and efficient, not cramped or cinematic.
- Readability wins over spectacle in every component decision.

## Palette and token overview

### Reference colors

- Ink: `--ref-ink-950` through `--ref-ink-100`
- Blue: `--ref-blue-500`, `--ref-blue-400`, `--ref-blue-300`
- Teal: `--ref-teal-500`, `--ref-teal-400`
- Amber: `--ref-amber-500`, `--ref-amber-400`
- Red: `--ref-red-500`, `--ref-red-400`
- Neutrals: `--ref-white`, `--ref-black`

### Semantic token categories

- Backgrounds and surfaces: `--color-bg-*`
- Text: `--color-text-*`
- Borders and separators: `--color-border-*`
- Accent, focus, and selection: `--color-accent*`, `--color-focus-ring`, `--color-selection-*`
- Status: `--color-success*`, `--color-warning*`, `--color-danger*`, `--color-info*`
- Icons: `--color-icon-*`
- Charts: `--color-chart-*`
- Shadows, spacing, typography, motion, opacity, z-index, and layout each have their own token groups

Use accent for focus, selected state, active controls, and small areas of emphasis. Use success, warning, and danger only for semantic state, not decoration. Components should consume semantic tokens only; raw reference colors are for theme definitions, not component styles.

## Typography rules

- Use body tokens for ordinary UI copy and control text.
- Use label tokens for compact labels, metadata, and dense control chrome.
- Use title tokens for card headings, panel titles, and section headers.
- Use display tokens only for rare dashboard hero numbers or splash-level headings.
- Uppercase with wider tracking is reserved for small metadata or eyebrow text, not normal body copy or form labels.
- Use `--font-mono` for IDs, coordinates, timestamps, filenames, and telemetry-like values.
- Avoid display styling in ordinary controls, tables, inline labels, or helper text.

## Surface and layout rules

- `--color-bg-canvas` is the app canvas.
- `--color-bg-surface` is the default panel and control surface.
- `--color-bg-surface-raised` is for slightly elevated surfaces like secondary buttons or overlays.
- `--color-bg-surface-sunken` is for inputs and recessed zones.
- Use `--color-border-default` and `--color-border-strong` as the primary structure mechanism.
- Default spacing should stay on the compact scale and feel comfortable in dense dashboards.
- Default corners should be `--radius-md` or `--radius-lg`; avoid pill-heavy styling unless there is a strong reason.

## Component styling guidance

- Buttons: primary uses accent fill with dark foreground; secondary uses raised dark surface plus border; focus is crisp and obvious.
- Inputs and selects: use sunken dark surfaces, clear borders, and a visible focus ring. Error state should combine border treatment with helper/error text.
- Cards and panels: default to solid dark surfaces with 1px borders and restrained radius.
- Tables and dense data views: rely on separators, subtle hover treatments, and restrained selected states.
- Tabs and segmented controls: show active state with surface, border, and text changes, not animation-heavy underlines.
- Badges and status markers: prefer tonal or outlined treatments over loud fills.
- Nav and shell surfaces: feel modular and panelized through spacing and separators rather than decorative chrome.
- Overlays: use raised surfaces, borders, and the shared overlay shadow sparingly.

## Decorative policy

Allowed for specialized screens only:

- faint coordinate grids
- crosshair marks
- subtle radial or range rings
- waveform separators
- telemetry micro-labels

Forbidden as base component defaults:

- glitch effects
- scanline overlays
- noisy textures on control backgrounds
- decorative radar graphics behind standard controls
- heavy gradients or glossy chrome

## Accessibility and usability rules

- Maintain strong dark-theme contrast for text and structure.
- Keep focus states obvious and never remove them without a replacement.
- Do not rely on color alone for invalid, selected, warning, or destructive states.
- Disabled states should remain readable and visibly distinct.
- Prefer calm, predictable interaction changes over dramatic animation.

## Future component checklist

- Does the component use semantic tokens only?
- Does it match Analyst Core surface, border, and radius rules?
- Is accent color intentional and sparse?
- Is the typography role appropriate for the content?
- Are hover, focus, selected, invalid, and disabled states clear?
- Is the component atmospheric only where that is actually appropriate?
- Would it still look good inside a dense dashboard with real data?

## File map

- Reference scales and raw palette tokens live in `src/styles/tokens/_foundations.scss`.
- Semantic spacing, typography, and compatibility aliases live in `src/styles/tokens/_semantic.scss`.
- Analyst Core theme colors and shadow semantics live in `src/styles/themes/_analyst-core.scss`.
- `src/styles/_tokens.scss` is the aggregator that keeps the public styles entry stable.
- `src/styles/index.scss` imports the tokens plus shared base styles.
- Future components should import `@repo/ui/styles` at the app level and use semantic CSS variables in component-local SCSS modules. Private Sass partials are fine when they prevent duplicated state logic.
