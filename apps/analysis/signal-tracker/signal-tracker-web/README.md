# Signal Tracker Web

React + TypeScript frontend powered by Vite. The web app uses Tailwind CSS as its styling foundation, shadcn/ui as the default local component layer, and Radix UI as the accessible primitive layer underneath many shadcn/ui components.

## Frontend UI foundation

Signal Tracker's frontend UI approach is layered:

1. Tailwind CSS controls styling, spacing, responsive layout, and design-token-driven visual control.
2. shadcn/ui provides copy-owned React component code styled with Tailwind.
3. Radix UI provides low-level accessible primitives underneath many shadcn/ui components.

Use shadcn/ui first for common UI components such as buttons, badges, inputs, textareas, dialogs, alert dialogs, dropdown menus, popovers, tooltips, collapsibles, sheets, tabs, skeletons, command menus, tables, and sidebars.

Use Radix UI directly only when shadcn/ui does not provide the needed primitive or when a Signal Tracker-specific interaction needs lower-level control.

Tailwind Plus and Catalyst, if used, should be treated as reference libraries and sources of implementation patterns, not as the controlling design system.

Avoid mixing multiple primitive systems for the same interaction type. Do not use shadcn/Radix, raw Radix, Headless UI, MUI, Ant Design, Mantine, or another component system interchangeably for the same modal, popover, dropdown, tooltip, tab, or collapsible behavior unless a specific exception is documented.

## Component organization

Prefer this local organization as product UI is built out:

```txt
src/components/ui/
  generic copy-owned shadcn-style primitives

src/components/signal-tracker/
  product-specific components for topics, entries, assessments, citations, evidence, source previews, uncited state, and review state
```

The `components/ui/` layer should stay generic and product-agnostic. The `components/signal-tracker/` layer should encode Signal Tracker product concepts and workflows.

## Component interface model

Keep component props narrow and intentional. A component should expose the smallest useful API for the current product surface, then grow only when a real caller needs the extra control.

For local UI primitives such as `Button`, prefer an explicit supported prop set like `children`, `onClick`, `size`, `variant`, `className`, `disabled`, and `type` over extending the full native HTML element prop type. When supported props come directly from a native element, define the narrow subset with `Pick<>` and spread only that picked subset onto the element. Avoid adding generic prop pass-throughs, `asChild`, broad `aria-*`, `data-*`, `id`, or similar escape hatches by default. Add them later when there is a specific implementation need and the added surface area is worth the complexity.

Apply the same principle across frontend work: choose the smallest clear interface that supports the current workflow, keep product concepts explicit, and resist speculative flexibility that makes call sites harder to scan.

## Local development

```bash
pnpm --filter signal-tracker-web dev
```

The web app loads `/config.json` at runtime when deployed. For local dev it
defaults to `http://localhost:3001` if the runtime config is missing.

## Runtime config (deployed)

The CDK stack writes `/config.json` into the site bucket with the deployed API
base URL, so the web app does not need rebuild-time env injection.

## State management

Redux Toolkit is wired through `src/store.ts`, with React-Redux typed hooks in
`src/storeHooks.ts`. RTK Query API modules live under `src/api/`; keep the base
`signalTrackerApi` setup there and add resource-specific endpoints under folders
like `src/api/topics/` and `src/api/evidence/`. Import request and response types
directly from `@repo/signal-tracker-shared` instead of duplicating them in the
web app.

## Backend test scaffold

The pre-product frontend used to exercise backend routes is preserved under
`src/backendTestScaffold/`. New product UI should start from the root `src/App.tsx`
entrypoint instead of extending that scaffold.

## Override the API locally (optional)

If you want to point at a non-local API during dev, set `VITE_API_URL`:

```bash
VITE_API_URL="https://your-api-id.execute-api.region.amazonaws.com" pnpm --filter signal-tracker-web dev
```
