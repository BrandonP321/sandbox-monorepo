# Storybook In `@repo/ui`

## Scope

Storybook lives inside `packages/ui` and is only for the shared UI package.

- config lives in [`packages/ui/.storybook`](./.storybook)
- stories live in [`packages/ui/src`](./src)
- Storybook currently loads `src/**/*.stories.tsx`
- Add `src/**/*.mdx` only when the package has its first docs-only MDX page

## Scripts

- `pnpm --filter @repo/ui storybook`
- `pnpm --filter @repo/ui build-storybook`
- `pnpm --filter @repo/ui test-storybook`

## Story conventions

- Use one story file per component.
- Keep stories args-based and predictable.
- Show representative states, not every theoretical combination.
- Use `play` functions only when they validate a meaningful interaction.

## Tags

- Autodocs is enabled globally in `preview.tsx`.
- Use `['autodocs', '!dev']` for docs-only examples.
- Use `['!test']` for combo/demo stories that should not run in Storybook Vitest.

## Decorators

- Put global decorators in [`packages/ui/.storybook/preview.tsx`](./.storybook/preview.tsx).
- Add local decorators in an individual story file only when the need is specific to that component.
- Prefer small wrapper decorators over hidden global mocks.

## Theme toolbar

- Storybook provides a global theme toolbar in `preview.tsx`.
- Keep it focused on token-level preview concerns, not app-specific themes.
- If the token system changes, update the toolbar decorator and the preview styles together.

## MSW

- Do not add MSW until a shared UI component actually depends on network requests.
- If that happens, configure it in `preview.tsx` and keep it package-local.

## Guidance for AI agents

- Add stories next to the component under `src`.
- Prefer importing icons from `../icons` or `../../icons` within the package, not from `lucide-react`.
- If a component already has unit tests, add a small set of stories that cover the same public states rather than duplicating edge-case test logic in Storybook.
- If a story is only useful as documentation, tag it so it does not run as a Storybook test.
