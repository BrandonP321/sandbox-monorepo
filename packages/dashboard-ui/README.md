# @repo/dashboard-ui

Reusable, styled dashboard UI primitives for repo frontends.

This package owns visual dashboard components and the default dashboard theme
that came from Signal Tracker. Behavior-only frontend patterns belong in
`@repo/ui-base`; app-specific routes, product copy, and domain components stay
inside the consuming app.

## Imports

Use the root export for route-agnostic dashboard primitives:

```tsx
import { Button, Card, ContentHeader } from "@repo/dashboard-ui";
```

Use the TanStack Router subpath for route-aware dashboard adapters:

```tsx
import { AppShell, ButtonLink } from "@repo/dashboard-ui/tanstack-router";
```

Import the stylesheet once from the app CSS entrypoint:

```css
@import "@repo/dashboard-ui/styles";
@source ".";
```

Apps can override the default theme by importing package styles first and then
redefining CSS variables:

```css
@import "@repo/dashboard-ui/styles";
@source ".";

:root {
  --background: #f7fafc;
  --primary: oklch(0.48 0.12 220);
}
```

The package stylesheet includes the shared Tailwind theme mapping and sources
the package's own component files. Consuming apps should keep their own
`@source` directive so Tailwind sees app-local class names too.

## Current Surface

- `Alert`
- `AlertDialog`, `DeleteConfirmationDialog`
- `Badge`
- `Button`
- `Card`
- `Chip`
- `ContentHeader`
- `Dialog`
- `DropdownMenu`
- layout helpers: `AutoGrid`, `Inline`, `Stack`, `WithAside`
- `EmptyState`
- form components: `Form`, `FormProvider`, `FormField`, inputs, selects, and
  submit buttons
- `Flashbar`
- route-agnostic app shell building blocks: content, header, main, sidebar,
  sidebar toggle, shell context, and shell context hook
- `LoadingState`
- notification renderers: `NotificationAlerts`, `NotificationFlashbar`
- `Popover`
- `Skeleton`
- `cn`
- TanStack Router adapters from `@repo/dashboard-ui/tanstack-router`:
  `AppShell`, `Breadcrumbs`, `ButtonLink`, and app shell route helpers

## Boundaries

- Do not import app code or Signal Tracker packages here.
- Keep TanStack Router adapters out of the root export; use
  `@repo/dashboard-ui/tanstack-router` for route-aware adapters.
- Keep notification state/providers in `@repo/ui-base/notifications`; this
  package owns only the dashboard notification renderers.
