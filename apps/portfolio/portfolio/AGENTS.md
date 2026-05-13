# AGENTS.md - Portfolio

## Scope

- The Portfolio app lives under `apps/portfolio/portfolio/`.
- This project intentionally has only web and infra packages. Do not add an API
  or project-shared package unless a concrete future requirement needs it.
- Keep the initial site scaffold lean. Add structure when content or repeated
  UI needs make the boundary useful.

## UI Direction

- Do not add `@repo/dashboard-ui` to this app. Portfolio should develop its own
  visual component set instead of inheriting dashboard primitives.
- `@repo/ui-base` is allowed for style-free behavior and helper components.
- Keep portfolio-specific visual components inside `portfolio-web` until reuse
  across multiple apps is real.

## Infra

- `portfolio-infra` deploys a static SPA only. Avoid API Gateway, Lambda, and
  API URL outputs unless the project explicitly grows an API.
