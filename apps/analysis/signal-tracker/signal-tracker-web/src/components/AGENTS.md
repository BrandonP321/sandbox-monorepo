# AGENTS.md - signal-tracker-web components

Also follow `../../AGENTS.md` for the Signal Tracker web UI foundation, component library boundaries, and validation commands.

## Component Interface Model

- Keep component props narrow and intentional. Start with the props the current UI needs, then expand the component API only when a real caller needs the extra control.
- When supported props come straight from a native element, define that supported subset with `Pick<React.ComponentProps<"...">, ...>` instead of manually rewriting each native prop type.
- Spread only the picked native prop subset onto the underlying element. Do not expose the full native element prop surface by default.
- Avoid generic prop pass-throughs and broad `aria-*`, `data-*`, `id`, `asChild`, or similar escape hatches unless a concrete Signal Tracker caller needs them.
- Use PascalCase filenames for React component files that export a component, such as `Button.tsx`. Keep non-component utility filenames lower-case or domain-named.
- Keep `src/components/ui/` product-agnostic. Copy-owned shadcn-style primitives belong there.
- Keep Signal Tracker product concepts in `src/components/signal-tracker/`, including topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
