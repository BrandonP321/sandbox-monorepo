# @repo/ui

Shared UI foundation for sandbox apps.

## Scope

This package is the shared source-of-truth for:

- lightweight shared styles in [`src/styles/index.scss`](./src/styles/index.scss)
- starter design tokens in [`src/styles/_tokens.scss`](./src/styles/_tokens.scss)
- small UI utilities in [`src/lib`](./src/lib)
- future primitives in [`src/components/primitives`](./src/components/primitives)
- future composed patterns in [`src/components/patterns`](./src/components/patterns)

The first exported primitive is `Button`, implemented with local SCSS module styles that consume the shared tokens.

## Current direction

This package is intentionally small.

- Build the system up from scratch in owned source.
- Prefer SCSS tokens plus plain React primitives over introducing a large component framework up front.
- Add shared primitives only when they are clearly foundational or already reused.
- Do not assume dark mode support by default.
- Keep app-specific layout and pattern code inside the app until reuse is real.

Today the shared surface is:

- global token and base-style entrypoint via `@repo/ui/styles`
- icon barrel via `@repo/ui/icons`
- `cn` utility
- `Icon` primitive backed by `lucide-react`
- `Button` primitive
- package-local Storybook for UI docs and story tests

Everything else should be added incrementally.

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

Apps should prefer `@repo/ui/icons` over importing `lucide-react` directly. That keeps the icon source centralized in the UI package and makes it easier to swap or wrap later if needed.

If an app wants shared package styles, it can import:

```ts
import "@repo/ui/styles";
```

For UI package docs, examples, and story-based tests, use the package-local Storybook setup documented in [`STORYBOOK.md`](./STORYBOOK.md).

The styles entry is SCSS and currently provides:

- raw and semantic color tokens
- foundational and semantic spacing tokens
- typography, radius, border, shadow, motion, z-index, and layout tokens
- icon size and stroke tokens
- base `html` and `body` defaults built on those tokens

## Token guidance

- Prefer semantic tokens in component styles such as `--color-primary` or `--color-border`.
- Use raw palette tokens only when defining semantic tokens.
- Reach for semantic spacing aliases such as `--space-stack-md` and `--space-inset-md` when they fit the layout intent.
- Icons should inherit `currentColor` and size from icon tokens unless a specific exception is needed.
- Add new tokens only when a clear shared need appears; avoid speculative token expansion.

## Rules

- Keep shared exports small and boring.
- App code should import Lucide glyphs from `@repo/ui/icons`, not from `lucide-react` directly.
- Prefer semantic token usage over raw palette usage in components.
- Add shared components only when they are foundational or clearly reusable.
- Keep app-specific patterns in the app until reuse is real.
