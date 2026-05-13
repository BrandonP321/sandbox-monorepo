# AGENTS.md - portfolio-web components

## Scope

- Keep portfolio visual components local to `portfolio-web` unless reuse across
  multiple apps becomes concrete.
- Do not import `@repo/dashboard-ui` here. Use `@repo/ui-base` only for
  style-free behavior helpers when needed.

## Component Shape

- Put reusable components in PascalCase folders with a component file, local
  barrel, focused test, and Storybook story when there is visible behavior.
- Keep prop APIs narrow. Prefer `Pick<React.ComponentProps<...>>` for supported
  native props instead of exposing every DOM attribute by default.
- Test user-visible behavior and accessibility-facing semantics rather than
  internal class names.
