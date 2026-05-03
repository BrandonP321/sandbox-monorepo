# AGENTS.md - signal-tracker-web

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Dev server: `pnpm --filter signal-tracker-web dev`
- Tests: `pnpm --filter signal-tracker-web test`
- Lint: `pnpm --filter signal-tracker-web lint`
- Typecheck: `pnpm --filter signal-tracker-web typecheck`
- Build: `pnpm --filter signal-tracker-web build`
- Storybook: `pnpm --filter signal-tracker-web storybook`
- Build Storybook: `pnpm --filter signal-tracker-web build-storybook`

## Notes

- Configure API base URL with `VITE_API_BASE_URL`, or use `VITE_API_STAGE=prod` as the local shortcut to the deployed API. Do not reintroduce `/config.json` runtime config.
- Keep Vite aliases for app-owned React/form runtime dependencies while Signal Tracker imports workspace packages that export source files; the Linux CodeBuild production build relies on app-level dependency resolution for those shared package imports.
- Use Tailwind CSS as the styling foundation, shadcn/ui as the default local component layer, and Radix UI as the accessible primitive layer usually consumed through shadcn/ui.
- Use Radix UI directly only when shadcn/ui does not provide the needed primitive or when a Signal Tracker-specific interaction needs lower-level control.
- Treat Tailwind Plus and Catalyst as reference or pattern sources only, not as the controlling design system.
- Do not import `@repo/ui`, `packages/ui`, or other styled shared UI packages.
- Use `@repo/ui-base` only for behavior abstractions.
- Keep generic copy-owned UI primitives product-agnostic in `src/components/ui/` and keep Signal Tracker-specific components in `src/components/signal-tracker/`.
- Put route-level page components and page-only helper components in `src/pages/`. Prefer list-page names such as `ListTopicsPage` for list/index routes rather than `View*Surface` names.
- Keep page components free of bespoke props. If page components ever need props, standardize those props across every page component instead of adding route-specific page prop contracts.
- Use TanStack Router for Signal Tracker page routing. Keep the route tree app-local and code-based unless the route set grows enough to justify file-route generation.
- Add app routes to the typed route registry in `src/routeRegistry.ts`, and reuse those registry values in router definitions, `Link` targets, and route hooks such as `useParams` instead of re-entering route path strings.
- Page routes should render page content directly for now; do not introduce an `AppShell` until multiple pages need shared persistent navigation or layout chrome.
- Keep Storybook stories focused on generic UI primitives in `src/components/ui/`; do not use Storybook stories for product workflows unless that scope is explicitly expanded.
- Signal Tracker-specific components should encode product concepts such as topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
- Do not mix shadcn/Radix, raw Radix, Headless UI, MUI, Ant Design, Mantine, or another UI system interchangeably for the same modal, popover, dropdown, tooltip, tab, or collapsible behavior unless a specific exception is documented.
- Keep component props narrow and intentional. Start with the props the current UI needs, then expand the component API only when a real caller needs the extra control.
- When supported props come straight from a native element, prefer `Pick<>` over manually rewriting each native prop type, then spread only that picked subset onto the underlying element.
- Do not extend full native HTML prop types, add generic prop pass-throughs, or expose broad `aria-*`, `data-*`, `id`, `asChild`, or similar escape hatches by default. Add them later only for a concrete Signal Tracker use case.
- Centralize API calls under `src/api/`. Keep RTK Query endpoints, query keys/tags, invalidation, and response parsing consistent instead of scattering raw `fetch` calls through components.
- Validate or narrow external data at the boundary, using `@repo/signal-tracker-shared` route contracts and schemas where they apply.
- When adding the first non-trivial form, add the minimal React Hook Form/Zod/`@repo/ui-base` integration needed for schema-driven forms instead of hand-wiring repeated field plumbing.
- If behavior is duplicated across Signal Tracker components and is general enough for reuse, extend `@repo/ui-base` with tests instead of copying it locally.
- Keep looking for component boundaries and reusable utilities as UI work grows; make small refactors when they keep the feature implementation clear and sustainable.
