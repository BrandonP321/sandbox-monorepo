# AGENTS.md - signal-tracker-web

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands

- Dev server: `pnpm --filter signal-tracker-web dev`
- Tests: `pnpm --filter signal-tracker-web test`
- Lint: `pnpm --filter signal-tracker-web lint`
- Typecheck: `pnpm --filter signal-tracker-web typecheck`
- Build: `pnpm --filter signal-tracker-web build`
- Storybook: `pnpm --filter signal-tracker-web storybook`
- Automation-friendly Storybook: `pnpm --filter signal-tracker-web storybook:ci`
- Build Storybook: `pnpm --filter signal-tracker-web build-storybook`

## Visual UI Verification

- For visual, responsive, page-shell, dialog, popover, menu, or layout-sensitive changes, inspect the affected UI with the Playwright CLI while work is in progress.
- Use Storybook for isolated primitives and components; use the routed app when the change depends on API state, routing, shell behavior, or a multi-step workflow.
- Put Storybook-only verification stories that are not tied to a component under `src/storybook/` so they stay separate from component stories.
- Prefer `pnpm --filter signal-tracker-web storybook:ci` for Playwright-driven Storybook checks so the server does not try to open its own browser window.
- When responsiveness is part of the change, check at least one narrow and one wide viewport or bounded Storybook container.
- Treat Playwright CLI snapshots, screenshots, and console logs as temporary artifacts. Do not commit `.playwright-cli/` output unless the user explicitly asks to preserve a debugging artifact.

## Runtime Notes

- Configure API base URL with `VITE_API_BASE_URL`, or use `VITE_API_STAGE=prod` as the local shortcut to the deployed API. Do not reintroduce `/config.json` runtime config.
- Keep Vite aliases for app-owned React/form runtime dependencies while Signal Tracker imports workspace packages that export source files; the Linux CodeBuild production build relies on app-level dependency resolution for those shared package imports.

## Local UI System

- Use Tailwind CSS as the styling foundation, shadcn/ui as the default local component layer, and Radix UI as the accessible primitive layer usually consumed through shadcn/ui.
- Use Radix UI directly only when shadcn/ui does not provide the needed primitive or when a Signal Tracker-specific interaction needs lower-level control.
- Treat Tailwind Plus and Catalyst as reference or pattern sources only, not as the controlling design system.
- Use `@repo/dashboard-ui` for extracted dashboard primitives and styles.
- Keep product-specific Signal Tracker UI app-local until a primitive clearly belongs in `@repo/dashboard-ui` or an issue explicitly requests extraction.
- Use `@repo/ui-base` only for behavior abstractions with small APIs and tests.
- Keep generic copy-owned UI primitives product-agnostic in `src/components/ui/` and keep Signal Tracker-specific components in `src/components/signal-tracker/`.
- Signal Tracker-specific components should encode product concepts such as topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
- Do not mix shadcn/Radix, raw Radix, Headless UI, MUI, Ant Design, Mantine, or another UI system interchangeably for the same dialog, popover, dropdown, tooltip, tab, or collapsible behavior unless a specific exception is documented.
- Prefer semantic tokens in component code. Raw palette utilities belong in theme definitions or temporary exploration code, not durable primitives.
- Text-like controls should be full-width by default. Put width and max-width decisions on field, form, or layout wrappers rather than on the control primitive itself.
- Use viewport breakpoints for page and shell layout, container queries for reusable component internals, and JavaScript media-query hooks only for runtime behavior that CSS cannot express.

## Routing And App Shell

- Put route-level page components and page-only helper components in `src/pages/`. Prefer list-page names such as `ListTopicsPage` for list/index routes rather than `View*Surface` names.
- Keep page components free of bespoke props. If page components ever need props, standardize those props across every page component instead of adding route-specific page prop contracts.
- Use TanStack Router for Signal Tracker page routing. Keep the route tree app-local and code-based unless the route set grows enough to justify file-route generation.
- Add app routes to the typed route registry in `src/routeRegistry.ts`, and reuse those registry values in router definitions, `Link` targets, and route hooks such as `useParams` instead of re-entering route path strings.
- Prefer nested route paths that build directly on parent paths and keep display-only path params required when they help shell navigation or future breadcrumbs, such as `/topics/$topicId/$topicName` and later children like `/topics/$topicId/$topicName/edit`.
- Configure shared app chrome as a TanStack Router parent/root component through `src/components/signal-tracker/SignalTrackerAppShell`. Use the TanStack-aware `AppShell` from `@repo/dashboard-ui/tanstack-router`; it owns `<Outlet />`, active route detection, header title selection, and sidebar link rendering.
- Add sidebar navigation through the Signal Tracker route model in `src/components/signal-tracker/SignalTrackerAppShell/routes.ts`; use route-level `visibleWhen`, `path`, `title`, `params`, and `children` definitions instead of adding route-specific link branches to the shell component.
- Keep generic dashboard primitive stories in `@repo/dashboard-ui`; use Signal Tracker Storybook stories for product workflows only when that scope is explicitly expanded.

## Component Interfaces

- Keep component props narrow and intentional. Start with the props the current UI needs, then expand the component API only when a real caller needs the extra control.
- When supported props come straight from a native element, prefer `Pick<>` over manually rewriting each native prop type, then spread only that picked subset onto the underlying element.
- Do not extend full native HTML prop types, add generic prop pass-throughs, or expose broad `aria-*`, `data-*`, `id`, `asChild`, or similar escape hatches by default. Add them later only for a concrete Signal Tracker use case.

## Data, Forms, And State

- Centralize API calls under `src/api/`. Keep RTK Query endpoints, query keys/tags, invalidation, and response parsing consistent instead of scattering raw `fetch` calls through components.
- Normalize API error display through `src/api` helpers such as `getApiErrorMessage`; do not parse RTK Query error payloads in page, dialog, or form components.
- Prefer the standardized `errorMessage` returned by wrapped RTK Query hooks as the display source for API failures, including inline submit errors in dialogs and forms. It is acceptable for submit handlers to use `runDialogConfirm` or mutation `unwrap()` results for control flow while rendering the hook-level `errorMessage` rather than storing a duplicate local submit-error string.
- Prefer the notification context for user-facing API failure display. Wrapped RTK Query hooks own the notification contract; components should arrange the right provider boundary around the hook instead of parsing or forwarding errors manually.
- The root `AppShell` flashbar is the only multi-notification surface. Nested provider contexts, including form error contexts, should show only the latest message and pass unsupported message types upward to the root flashbar.
- Forms clear notifications from their nearest provider on submit. If a form-related RTK Query hook is called outside the `<Form>` element but should render form-local errors, lift the app-local `FormProvider` or a thin product-specific provider wrapper above the component that owns the hook.
- Validate or narrow external data at the boundary, using `@repo/signal-tracker-shared` route contracts and schemas where they apply.
- For forms that submit API contract data, compose form schemas from shared contract/domain schema builders rather than duplicating Zod field rules locally. Use shared default validation messages by default, override only when different UI copy materially improves the workflow, and parse through the final shared request schema before calling an RTK Query mutation.
- When adding the first non-trivial form, add the minimal React Hook Form/Zod/`@repo/ui-base` integration needed for schema-driven forms instead of hand-wiring repeated field plumbing.
- If behavior is duplicated across Signal Tracker components and is general enough for reuse, extend `@repo/ui-base` with tests instead of copying it locally.
- Keep looking for component boundaries and reusable utilities as UI work grows; make small refactors when they keep the feature implementation clear and sustainable.
