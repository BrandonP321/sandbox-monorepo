# AGENTS.md - @repo/dashboard-ui

Also follow the repo root `AGENTS.md` for shared-package boundaries, testing,
and dependency direction.

## Scope

- Keep this package focused on reusable, styled dashboard UI primitives and
  dashboard theme CSS.
- Do not import app code, Signal Tracker packages, product-specific copy,
  product-specific route definitions, or domain-specific icon registries.
- Put behavior-only frontend patterns in `@repo/ui-base`, not here.
- Keep route-aware adapters out of the root export. TanStack Router-specific UI
  belongs in a dedicated subpath such as `@repo/dashboard-ui/tanstack-router`.
- Keep route-agnostic shell layout pieces in the root component surface and
  put TanStack Router `Link`, `Outlet`, router-state, and route-param typing
  adapters under `src/tanstack-router`.

## Components

- Keep each standalone primitive in its own PascalCase folder with colocated
  implementation, tests, stories, and an `index.ts` public surface.
- Prefer narrow, purpose-built props. Expose native props only when a real
  consumer needs them.
- Use semantic tokens and semantic Tailwind utilities in durable component
  code. Raw palette utilities belong in theme definitions or temporary
  exploration.
- Use component variants for repeated visual states, sizes, and intents.
- Use `danger` for visual variants and color tokens, and reserve `error` for
  failure state or messages.

## Styling

- `src/styles/index.css` owns the dashboard Tailwind theme mapping, default
  CSS variables, base styles, and package source directives.
- Apps should import `@repo/dashboard-ui/styles` before any app-level variable
  overrides.
- Keep package source directives aligned with every folder that contains
  durable Tailwind classes, including route-aware adapter subpaths.
- Do not add dark mode, broad theming machinery, or new design tokens unless a
  concrete consuming app requires them.

## Tests And Stories

- Add focused tests for behavior a user or consuming component can observe.
- Add Storybook stories for visual states and layout-sensitive variants.
- In Storybook Vite config, merge only package-specific needs such as the
  Tailwind plugin and local aliases. Do not merge the package Vite config
  wholesale, because `@storybook/react-vite` already owns the React plugin and
  React Refresh wiring in dev.
- Run package `lint`, `typecheck`, `test`, and `build-storybook` after changing
  public component behavior or styling.
