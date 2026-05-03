# AGENTS.md - signal-tracker-web pages

Also follow `../../AGENTS.md` for Signal Tracker web routing, UI stack, and validation commands.

## Page Components

- Keep route-level page components in `src/pages/`, grouped by page folder when the page has page-only components, hooks, or helpers.
- Prefer list-page names such as `ListTopicsPage` for list/index routes rather than `View*Surface` names.
- Keep page components free of bespoke props. If page components ever need props, standardize those props across every page component instead of adding route-specific page prop contracts.
- Page-only child components may live beside the page that owns them. Promote them only when a second page has a concrete need for the same component.

## Routing

- Use TanStack Router for page routing.
- Add route paths to the typed route registry in `src/routeRegistry.ts`, and reuse those registry values in router definitions, `Link` targets, and route hooks such as `useParams`.
- Prefer anchor-style navigation through TanStack `Link` for user-visible page navigation. Use imperative navigation only for flows that are not naturally represented as links, such as post-submit redirects.
- Page routes should render page content directly for now; do not introduce an `AppShell` until multiple pages need shared persistent navigation or layout chrome.
