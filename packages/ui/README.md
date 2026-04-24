# @repo/ui

Shared styled UI foundation for sandbox apps.

## Scope

This package is the shared source-of-truth for:

- lightweight shared styles in [`src/styles/index.scss`](./src/styles/index.scss)
- Analyst Core design tokens in [`src/styles/_tokens.scss`](./src/styles/_tokens.scss)
- small UI utilities in [`src/lib`](./src/lib)
- styled wrappers around behavior primitives from `@repo/ui-base`
- future primitives in [`src/components/primitives`](./src/components/primitives)
- future composed patterns in [`src/components/patterns`](./src/components/patterns)
- theme guidance in [`docs/THEME_ANALYST_CORE.md`](./docs/THEME_ANALYST_CORE.md)
- component ownership guidance in [`docs/COMPONENT_MENTAL_MODEL.md`](./docs/COMPONENT_MENTAL_MODEL.md)

The current primitives are implemented with local CSS modules that consume the package tokens. Shared behavior that should be reused across multiple designed UI packages is being migrated into `@repo/ui-base`.

## Current direction

This package is intentionally small.

- Build the system up from scratch in owned source.
- Prefer SCSS tokens plus plain React primitives over introducing a large component framework up front.
- Add shared primitives only when they are clearly foundational or already reused.
- Analyst Core is the single supported theme today.
- Keep app-specific layout and pattern code inside the app until reuse is real.
- For the coordinated shell family, follow the ownership rules in
  [`docs/COMPONENT_MENTAL_MODEL.md`](./docs/COMPONENT_MENTAL_MODEL.md).

Today the shared surface is:

- global token and base-style entrypoint via `@repo/ui/styles`
- icon barrel via `@repo/ui/icons`
- `cn` utility
- `Icon` primitive backed by `lucide-react`
- `Button` primitive
- `ButtonGroup` primitive
- `AppShell` structural primitive
- `Masthead` structural primitive
- `SidebarNav` structural primitive
- `PageHeader` page-level structural primitive
- `Container` content primitive for grouped dashboard content
- `Alert` primitive
- `Input`, `Dropdown`, `CheckboxGroup`, and `RadioGroup` form primitives
- package-local Storybook for UI docs and targeted browser story tests

Everything else should be added incrementally.

## Mental model

Read [`docs/COMPONENT_MENTAL_MODEL.md`](./docs/COMPONENT_MENTAL_MODEL.md)
before adding new structural or layout components.

The short version:

- `AppShell` owns shell layout and shell coordination state.
- `Masthead` owns global chrome.
- `SidebarNav` owns navigation semantics.
- `PageHeader` owns page identity and page-level controls inside `main`.
- `Container` owns bordered content framing with optional header, footer, and media.
- Future page/layout components should keep similarly narrow ownership.
- Context is allowed for the coordinated shell family, but should not become the
  default answer for unrelated primitives.
- Keep semantics pragmatic: use native HTML and the minimum ARIA/data attributes
  needed for real behavior, not exhaustive attribute surfaces.

## Usage

Use shared utilities from the package entrypoint:

```ts
import { cn } from "@repo/ui";
```

Use the shared button primitive:

```tsx
import { Button } from "@repo/ui";
import { ArrowRight } from "@repo/ui/icons";

<Button iconRight={ArrowRight}>Continue</Button>;
```

Use the shared icon primitive with a shared icon export:

```tsx
import { Icon } from "@repo/ui";
import { Plus } from "@repo/ui/icons";

<Icon icon={Plus} />;
```

Use the shared alert primitive for inline status messaging:

```tsx
import { Alert } from "@repo/ui";

<Alert title="Heads up">
  Background sync is paused until credentials are updated.
</Alert>;
```

Use the shared button-group primitive to lay out related button actions:

```tsx
import { Button, ButtonGroup } from "@repo/ui";

<ButtonGroup>
  <Button variant="secondary">Cancel</Button>
  <Button>Save draft</Button>
</ButtonGroup>;
```

Use the shared container primitive to group related content:

```tsx
import { Container, PageHeader } from "@repo/ui";

<>
  <PageHeader title="Port of Los Angeles" />
  <Container header="Summary">Main content region</Container>
</>;
```

Apps should prefer `@repo/ui/icons` over importing `lucide-react` directly. That keeps the icon source centralized in the UI package and makes it easier to swap or wrap later if needed.

If an app wants shared package styles, it can import:

```ts
import "@repo/ui/styles";
```

For UI package docs, examples, and targeted browser story tests, use the package-local Storybook setup documented in [`STORYBOOK.md`](./STORYBOOK.md).

The styles entry is SCSS and currently provides:

- reference and semantic color tokens for Analyst Core
- foundational and semantic spacing tokens
- typography, radius, border, shadow, motion, z-index, and layout tokens
- icon size and stroke tokens
- base `html` and `body` defaults built on those tokens

## Token guidance

- Prefer semantic tokens in component styles such as `--color-bg-surface` or `--color-text-secondary`.
- Use raw palette tokens only when defining semantic tokens.
- Reach for semantic spacing aliases such as `--space-stack-md` and `--space-inset-md` when they fit the layout intent.
- Icons should inherit `currentColor` and size from icon tokens unless a specific exception is needed.
- Add new tokens only when a clear shared need appears; avoid speculative token expansion.

## Rules

- Keep shared exports small and boring.
- App code should import Lucide glyphs from `@repo/ui/icons`, not from `lucide-react` directly.
- Prefer semantic token usage over raw palette usage in components.
- Keep new components aligned to Analyst Core and document shared style decisions in the theme doc.
- Add shared components only when they are foundational or clearly reusable.
- Keep app-specific patterns in the app until reuse is real.
- Do not add extra ARIA or `data-*` APIs unless they support real behavior,
  styling, or a concrete repo use case.
