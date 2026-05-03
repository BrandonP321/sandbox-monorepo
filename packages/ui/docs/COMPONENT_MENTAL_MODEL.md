# UI Component Mental Model

This document captures the current mental model for building shared components in
`@repo/ui`. Future components should follow this unless there is a clear,
intentional reason to change direction.

## Package default

`@repo/ui` is an owned, opinionated design system for personal projects. It is
not trying to be a general-purpose component framework.

Default assumptions:

- Build composable structural components first.
- Prefer token-driven CSS Modules over large abstraction layers.
- Keep public APIs small and obvious.
- Add coordination logic only when it simplifies a repeated shell-level pattern.
- Reuse `@repo/ui/icons` and semantic tokens instead of app-local variants.
- Prefer pragmatic semantics over exhaustive accessibility surface area. This
  package should keep the native HTML and ARIA that support real behavior or
  obvious usability, but should not grow extra attributes just for theoretical
  completeness.

## Pragmatic semantics rule

`@repo/ui` is for personal projects, not a compliance-oriented component
library.

That means:

- Keep native semantics that come for free or directly support the component
  contract.
- Keep ARIA when the component needs it to coordinate behavior or label controls
  that would otherwise be ambiguous, such as icon-only buttons or shell toggles.
- Keep data attributes only when they drive styling, state, or a concrete
  consumer integration.
- Do not add extra ARIA props, pass-through attributes, or test-only data hooks
  just to make the API feel more complete.
- Do not add alternative labeling APIs unless a real usage in this repo needs
  them.

Examples:

- Worth keeping: form labels, `aria-expanded` on coordinated shell toggles,
  `aria-controls` when one owned control opens or closes another owned region.
- Usually not worth adding: arbitrary `data-*` escape hatches, optional ARIA
  prop passthrough on every primitive, or extra landmarks purely for ceremony.

## Component categories

There are three useful categories in this package:

- Structural shell primitives: components that own layout regions and shell
  coordination.
- Semantic content primitives: components that own a specific piece of content
  semantics or interaction, but not app layout.
- Layout helpers: components that own spacing or grid behavior only.

Current examples:

- Structural shell primitives: `AppShell`, `Masthead`, `SidebarNav`
- Semantic content primitives: `Alert`, `Button`, `Container`, form controls, `PageHeader`
- Future layout helpers: `Stack`, `Grid`

## Ownership rules

When adding or reviewing a component, answer two questions:

1. What layout does this component own?
2. What semantics does this component own?

The answers should stay narrow and defensible.

### AppShell

- Owns: top-level shell layout, skip link, shell header region, main region,
  structural sidebar/aside regions, shell coordination state through context.
- Does not own: navigation semantics, page heading semantics, page-specific
  tools, business logic.
- Important rule: `AppShell.sidebar` and `AppShell.aside` are structural
  regions, not `nav` or `aside` landmarks. Child components own those semantics
  when needed.

### Masthead

- Owns: global app bar structure and global chrome.
- Usually lives inside: `AppShell.masthead`
- Does not own: page `h1`, breadcrumbs, page-local filters by default.
- Important rule: `Masthead` may consume `AppShell` context for shell-specific
  controls such as the built-in sidebar toggle.

### SidebarNav

- Owns: navigation semantics, nav groups, nav items, active/disabled state
  rendering.
- Usually lives inside: `AppShell.sidebar`
- Does not own: shell layout, page content, page titles.
- Important rule: `SidebarNav` owns the `nav` landmark. `AppShell` must not wrap
  it in another `nav`.

### PageHeader

- Owns: page identity, page-level heading, optional supporting page context,
  page-level actions, and optional tools/filter row inside `main`.
- Usually lives inside: the top of a page or workspace view within `main`
- Does not own: shell layout, breadcrumb navigation semantics, or page body
  sections below the header.
- Important rule: `PageHeader` should usually own the page `h1`, while
  breadcrumb content passed into it should own its own navigation semantics when
  needed.

### Container

- Owns: bordered content framing, optional header/footer regions, and optional
  media placement around a related content group.
- Usually lives inside: `main`, often below `PageHeader` or inside a broader
  page layout.
- Does not own: page identity, shell layout, or highly specialized data-display
  behavior.
- Important rule: `Container` is the default panel-like surface for this
  package. Keep it generic and restrained; if a future use case needs a richer
  panel abstraction, that should be a separate component.

### Planned components

These role boundaries should guide future implementation:

- `Panel`: bordered module surface with optional header/body/footer
- `SplitPane`: internal two-pane workbench layout only
- `DetailPanel`: supplemental inspector/filter/detail surface, often inside
  `AppShell.aside` or `SplitPane.secondary`
- `Stack`: spacing helper only
- `Grid`: layout helper only

## Context rule

The package default is still to prefer dumb, prop-driven primitives.

The current exception is the shell family:

- `AppShell` provides shell coordination state through context.
- `Masthead` and `SidebarNav` are allowed to consume that context.
- This is acceptable because the shell family is intentionally opinionated and
  tightly coordinated for personal projects.

Do not spread this pattern everywhere.

Use context only when all of these are true:

- the components form one coherent subsystem
- the coordination logic is shell-level, not business-level
- the implicit coupling makes common usage simpler than explicit prop wiring

Avoid context when plain props are clearer.

## Landmark and semantics guidance

Landmarks should be owned by the component whose primary role matches the
semantic meaning:

- `AppShell` owns shell-level `header` and `main`
- `SidebarNav` owns `nav`
- future `DetailPanel` may own complementary/detail semantics
- `PageHeader` may own the page heading

Do not duplicate landmarks just because a component is visually nested inside
another one.

Use the smallest semantic surface that keeps the component understandable.
Prefer native elements first. Add extra ARIA only when it carries real meaning
for how the component works in these projects.

## API guidance

When choosing a public API:

- Prefer a single clear API, not multiple parallel patterns.
- Prefer small data-driven APIs when they are simpler than compound composition.
- Prefer slots when the visual structure is stable but content varies.
- Add controlled/uncontrolled support only where state coordination is a real
  package concern.
- Do not add generic attribute escape hatches unless there is a concrete need
  for them in the repo.

Current examples:

- `SidebarNav` uses a data API for sections and items.
- `Masthead` uses slot props.
- `AppShell` supports controlled or uncontrolled open state because it owns the
  shell coordination model.

## Styling guidance

- Use semantic tokens only in component styles.
- Structural emphasis should come from borders, separators, spacing, and surface
  tone before shadows.
- Accent should stay restrained and communicate active/focus/selected state.
- Default to compact, dashboard-friendly density.

## Storybook guidance

- For standalone component stories, show the component in isolation.
- For shell-system behavior, use coordinated stories that compose `AppShell`,
  `Masthead`, and `SidebarNav` together.
- If a bug is about shell interaction, add a story-level regression guard in the
  relevant shell story.

## Testing guidance

- Add at least one regression guard for every behavioral change.
- Apply the 80/20 rule: prefer the smallest behavior-focused test set that protects the meaningful component contract.
- Static structure can be covered with server-rendered markup tests.
- Use Storybook play tests sparingly for browser-only behavior that markup tests do not exercise.
- Interactive shell behavior and meaningful form flows are the default cases where story-level guards still belong.
- Avoid asserting styling implementation details unless the visual token or class is the behavior under test.

## Change discipline

If a future component forces you to violate this document, update this document
in the same change and explain the new rule plainly.
