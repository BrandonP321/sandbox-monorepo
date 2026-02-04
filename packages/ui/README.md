# @repo/ui

Shared UI primitives and Mantine theme for sandbox apps.

## What's included

- `UiProvider` wraps Mantine with the standard theme.
- `QueryStatus` renders consistent loading/error/success UI for async requests.
- `PageTitle` is a small typography helper for page headings.
- `@repo/ui/styles` provides the default Mantine base styles for standard apps.

## Usage

```tsx
import "@repo/ui/styles";
import { UiProvider } from "@repo/ui";

createRoot(root).render(
  <UiProvider>
    <App />
  </UiProvider>
);
```

```tsx
import { PageTitle, QueryStatus } from "@repo/ui";

<QueryStatus
  isLoading={isLoading}
  isError={isError}
  isSuccess={isSuccess}
  loadingMessage="Loading data..."
  errorMessage="Something went wrong."
  successMessage="All good."
/>
```

## Styles

`@repo/ui/styles` currently imports `@mantine/core/styles.css` only.

If you need additional Mantine package styles (dates, notifications, etc.), add them to
`packages/ui/src/styles/index.ts` (or create a new styles entry under `packages/ui/src/styles/` and export it from
`packages/ui/package.json`). Apps should not import Mantine styles directly without approval.
