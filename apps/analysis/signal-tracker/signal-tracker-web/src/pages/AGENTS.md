# AGENTS.md - signal-tracker-web pages

Also follow `../../AGENTS.md` for Signal Tracker web routing, UI stack, and validation commands.

## Page Components

- Keep route-level page components in `src/pages/`, grouped by page folder when the page has page-only components, hooks, or helpers.
- Prefer list-page names such as `ListTopicsPage` for list/index routes rather than `View*Surface` names.
- Keep page components free of bespoke props. If page components ever need props, standardize those props across every page component instead of adding route-specific page prop contracts.
- Page-only child components may live beside the page that owns them. Promote them only when a second page has a concrete need for the same component.

## Loading States

- For now, use the simple shared `LoadingState` spinner for page-level loading. Do not add skeleton loading to pages unless the user explicitly asks for it; skeletons are deferred until the UI surface is stable enough to justify the extra implementation overhead.

## Not Found States

- Use the shared `ResourceNotFound` UI primitive for resource-specific missing states that need caller-defined actions, such as a missing topic details response.
- Use the shared `PageNotFound` wrapper for true page-level 404 states. Keep it standardized through its `homePath` action instead of adding page-specific actions unless a concrete use case requires broadening the wrapper later.
- Keep these edge cases simple: override title/description only when helpful, and avoid creating page-specific fallback headers or bespoke not-found layouts.

## Routing

- Use TanStack Router for page routing.
- Add route paths to the typed route registry in `src/routeRegistry.ts`, and reuse those registry values in router definitions, `Link` targets, and route hooks such as `useParams`.
- Prefer anchor-style navigation through TanStack `Link` for user-visible page navigation. Use imperative navigation only for flows that are not naturally represented as links, such as post-submit redirects.
- Page routes render inside the parent/root `SignalTrackerAppShell` configured in the TanStack Router tree. The shell owns the viewport, sidebar, header, and main scroll region; page components should render content sections rather than duplicating viewport-level `<main>`, page scroll wrappers, or per-page shell instances.
- Do not wire sidebar navigation from page components. Add or change shell nav entries in `src/components/signal-tracker/SignalTrackerAppShell/routes.ts`, where visibility and active-state rules live with the route node data.
