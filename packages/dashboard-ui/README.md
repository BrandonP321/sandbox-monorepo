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
- `LoadingState`
- notification renderers: `NotificationAlerts`, `NotificationFlashbar`
- `Popover`
- `Skeleton`
- `cn`

## Boundaries

- Do not import app code or Signal Tracker packages here.
- Keep TanStack Router adapters out of the root export; use a future
  `@repo/dashboard-ui/tanstack-router` subpath for route-aware adapters.
- Keep notification state/providers in `@repo/ui-base/notifications`; this
  package owns only the dashboard notification renderers.
