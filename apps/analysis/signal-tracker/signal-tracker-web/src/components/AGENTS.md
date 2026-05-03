# AGENTS.md - signal-tracker-web components

Also follow `../../AGENTS.md` for the Signal Tracker web UI foundation, component library boundaries, and validation commands.

## Component Interface Model

- Prefer named components over large inline JSX blocks when a render path becomes hard to scan.
- Keep component props narrow and intentional. Start with the props the current UI needs, then expand the component API only when a real caller needs the extra control.
- Prefer opinionated component APIs for common interaction flows. Put repeated standard actions behind small props or helper components, and leave unusual layouts for explicit custom composition when a real caller needs them.
- When one primitive is a specialized version of another, compose the existing primitive instead of duplicating state management, async handling, shell markup, or styling. Add narrow extension props to the base primitive when that is enough.
- When supported props come straight from a native element, define that supported subset with `Pick<React.ComponentProps<"...">, ...>` instead of manually rewriting each native prop type.
- Spread only the picked native prop subset onto the underlying element. Do not expose the full native element prop surface by default.
- Avoid generic prop pass-throughs and broad `aria-*`, `data-*`, `id`, `asChild`, or similar escape hatches unless a concrete Signal Tracker caller needs them.
- Use component variants for repeated styling patterns instead of pasting the same long Tailwind class strings across call sites.
- Use semantic HTML, labels, keyboard-safe primitives, and accessibility behavior provided by shadcn/ui or Radix. Avoid bespoke exhaustive ARIA APIs by default.
- Keep React context hooks, shared behavior helpers, and non-component exports in separate files from component modules when exporting them would violate Fast Refresh lint rules.
- Use PascalCase filenames for React component files that export a component, such as `Button.tsx`. Keep non-component utility filenames lower-case or domain-named.
- Keep `src/components/ui/` product-agnostic. Copy-owned shadcn-style primitives belong there.
- Keep Signal Tracker product concepts in `src/components/signal-tracker/`, including topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
- Keep primitive responsibilities separate: positioned content, command menus, disclosure sections, modal dialogs, and confirmation dialogs should not borrow behavior from each other unless one is intentionally implemented as a thin specialization of another.
- Do not add richer APIs such as checkbox/radio menu items, submenus, accordion grouping, broad positioning controls, or form-specific behavior to primitives until a concrete caller needs them.

## Forms

- Prefer controlled form controls with `value` and `onChange`; avoid uncontrolled `defaultValue` props unless a concrete caller needs uncontrolled behavior.
- Form layout wrappers should allow omitted IDs and generate stable local IDs while still preserving explicit IDs when callers need stable control references.
- React Hook Form wrappers should reuse behavior-only controls from `@repo/ui-base` and compose them with Signal Tracker-local visual primitives.
- Prefer schema-derived required state from `@repo/ui-base` for form wrappers, with explicit overrides only when a caller needs to diverge from the schema.

## Stories And Tests

- Keep Storybook examples visually bounded. If an example relies on `w-full`, give it an explicit parent width or stable fixed example width so preview wrappers do not collapse or hide it.
- Include a simple default story for the expected 80 percent use case. Add one manual or controlled story only when it demonstrates a reusable composition pattern future agents are likely to need.
- Tests should exercise user-visible behavior and the accessibility semantics of the underlying primitive, including keyboard activation when that is the primary or most reliable way to trigger the Radix behavior in jsdom.
