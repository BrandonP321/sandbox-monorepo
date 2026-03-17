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

## Component categories

There are three useful categories in this package:

- Structural shell primitives: components that own layout regions and shell
  coordination.
- Semantic content primitives: components that own a specific piece of content
  semantics or interaction, but not app layout.
- Layout helpers: components that own spacing or grid behavior only.

Current examples:

- Structural shell primitives: `AppShell`, `Masthead`, `SidebarNav`
- Semantic content primitives: `Alert`, `Button`, form controls
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

### Planned components

These role boundaries should guide future implementation:

- `PageHeader`: page identity and page-level controls inside `main`
- `PageSection`: consistent page content zone with light layout ownership
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
- future `PageHeader` may own the page heading

Do not duplicate landmarks just because a component is visually nested inside
another one.

## API guidance

When choosing a public API:

- Prefer a single clear API, not multiple parallel patterns.
- Prefer small data-driven APIs when they are simpler than compound composition.
- Prefer slots when the visual structure is stable but content varies.
- Add controlled/uncontrolled support only where state coordination is a real
  package concern.

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
- Static structure can be covered with server-rendered markup tests.
- Interactive shell behavior should usually be covered in Storybook play tests.

## Change discipline

If a future component forces you to violate this document, update this document
in the same change and explain the new rule plainly.
