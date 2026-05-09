# AGENTS.md - signal-tracker-web components

Also follow `../../AGENTS.md` for the Signal Tracker web UI foundation, component library boundaries, and validation commands.

## Component Interface Model

- Prefer named components over large inline JSX blocks when a render path becomes hard to scan.
- For multi-section product components, keep the parent component focused on composition and layout. Move section-specific UI and mutation/query hooks into the section component that owns that interaction instead of centralizing all RTK Query hooks in the parent by default.
- Keep component props narrow and intentional. Start with the props the current UI needs, then expand the component API only when a real caller needs the extra control.
- Prefer opinionated component APIs for common interaction flows. Put repeated standard actions behind small props or helper components, and leave unusual layouts for explicit custom composition when a real caller needs them.
- When one primitive is a specialized version of another, compose the existing primitive instead of duplicating state management, async handling, shell markup, or styling. Add narrow extension props to the base primitive when that is enough.
- When supported props come straight from a native element, define that supported subset with `Pick<React.ComponentProps<"...">, ...>` instead of manually rewriting each native prop type.
- Spread only the picked native prop subset onto the underlying element. Do not expose the full native element prop surface by default.
- Avoid generic prop pass-throughs and broad `aria-*`, `data-*`, `id`, `asChild`, or similar escape hatches unless a concrete Signal Tracker caller needs them.
- Use component variants for repeated styling patterns instead of pasting the same long Tailwind class strings across call sites.
- Prefer reusable layout primitives or small local layout components for repeated arrangements. Avoid long one-off class strings when a pattern has already appeared in multiple call sites.
- Use the local `Layout` primitive family from `src/components/ui/` for repeated vertical stacks, inline action rows, auto grids, and main/aside layouts before adding new ad hoc layout class strings.
- Keep width decisions at the field, form, or layout wrapper layer. Do not add fixed widths to reusable controls unless the control's own behavior requires it.
- Use viewport breakpoints for page and shell layouts. Use container queries for reusable component internals so components adapt to the space they are placed in.
- Use JavaScript media-query hooks only for runtime behavior that CSS cannot express, not for presentation-only layout changes.
- Do not add broad `useResponsive`, `useBreakpoint`, or presentation-only `useMediaQuery` hooks for styling, spacing, reflow, or ordinary show/hide behavior. Use Tailwind viewport breakpoints or container queries for those cases.
- Use `ContentHeader` from `src/components/ui/` for page, section, card, dialog, and form-section headings instead of raw `h1`-`h6` markup. Keep semantic `headingLevel` correct, and use `headingSize` values such as `h1`, `h2`, or `h5` when a heading should follow a different visual scale.
- Do not add `aria-labelledby` wiring around ordinary `ContentHeader` sections for now; keep the markup uncluttered until Signal Tracker takes on a dedicated accessibility pass.
- Use semantic HTML, labels, keyboard-safe primitives, and accessibility behavior provided by shadcn/ui or Radix. Avoid bespoke exhaustive ARIA APIs by default.
- Keep React context hooks, shared behavior helpers, and non-component exports in separate files from component modules when exporting them would violate Fast Refresh lint rules.
- Use PascalCase filenames for React component files that export a component, such as `Button.tsx`. Keep non-component utility filenames lower-case or domain-named.
- Keep `src/components/ui/` product-agnostic. Copy-owned shadcn-style primitives belong there.
- Keep Signal Tracker product concepts in `src/components/signal-tracker/`, including topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
- Keep primitive responsibilities separate: positioned content, command menus, disclosure sections, dialogs, and confirmation dialogs should not borrow behavior from each other unless one is intentionally implemented as a thin specialization of another.
- Do not add richer APIs such as checkbox/radio menu items, submenus, accordion grouping, broad positioning controls, or form-specific behavior to primitives until a concrete caller needs them.

## Forms

- Prefer controlled form controls with `value` and `onChange`; avoid uncontrolled `defaultValue` props unless a concrete caller needs uncontrolled behavior.
- Use `TextInput` and `FormTextInput` as the generic fallback for string-valued input fields that do not yet have a more specific component. Avoid reintroducing ambiguous `Input` or `FormInput` call sites when the value kind is known.
- Text-like controls should render full width by default. Constrain form layouts through `FormField`, form sections, dialogs, or layout primitives instead of narrowing the input primitive.
- Form layout wrappers should allow omitted IDs and generate stable local IDs while still preserving explicit IDs when callers need stable control references.
- React Hook Form wrappers should reuse behavior-only controls from `@repo/ui-base` and compose them with Signal Tracker-local visual primitives.
- Prefer schema-derived required state from `@repo/ui-base` for form wrappers, with explicit overrides only when a caller needs to diverge from the schema.
- Product forms should import shared Signal Tracker schema shapes or builders for contract-backed fields instead of recreating `z.string()` field rules locally. Keep local form code focused on layout, submit orchestration, and rare message overrides.
- Form action buttons should disable while React Hook Form is submitting. Reserve loading/busy state for the submit action or a button that is actually performing the submitted work; cancel/secondary actions should usually disable without `aria-busy`.

## Stories And Tests

- Keep Storybook examples visually bounded. If an example relies on `w-full`, give it an explicit parent width or stable fixed example width so preview wrappers do not collapse or hide it.
- For layout-sensitive, responsive, overlay, or visually dense component changes, use the Playwright CLI against the relevant Storybook story during implementation. Inspect narrow and wide examples when the component has responsive behavior.
- Include a simple default story for the expected 80 percent use case. Add one manual or controlled story only when it demonstrates a reusable composition pattern future agents are likely to need.
- Tests should exercise user-visible behavior and the accessibility semantics of the underlying primitive, including keyboard activation when that is the primary or most reliable way to trigger the Radix behavior in jsdom.
- Prefer role, label, and accessible-name queries over test IDs or implementation selectors. Do not assert Tailwind class names unless the class is the behavior being protected.
- Keep primitive tests thin. Put most regression coverage in the composed form, dialog, or product workflow where the user-visible behavior actually emerges.
