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
- If multiple stories need the same composed example, extract a small story-only
  helper under `src/storybook/examples` and reuse that helper.
- Share args objects, example components, or render helpers instead of exporting
  a prebuilt React element.
- Use `play` functions only when they validate browser-only behavior that the unit tests do not already cover.
- Prefer unit tests for static structure, slot rendering, and prop-driven variants.
- Do not keep token or layout smoke assertions in stories unless a browser-only regression has made them necessary.

## Tags

- Autodocs is enabled globally in `preview.tsx`.
- Use `['autodocs', '!dev']` for docs-only examples.
- Use `['!test']` for combo/demo stories that should not run in Storybook Vitest.

## Decorators

- Put global decorators in [`packages/ui/.storybook/preview.tsx`](./.storybook/preview.tsx).
- Add local decorators in an individual story file only when the need is specific to that component.
- Prefer small wrapper decorators over hidden global mocks.

## Preview theme

- Storybook previews the single Analyst Core theme defined by `@repo/ui/styles`.
- Keep the preview wrapper in `preview.tsx` aligned with the shared canvas and text tokens.
- Do not add alternate light/dark or contrast theme toggles until the package intentionally supports more than one theme.

## MSW

- Do not add MSW until a shared UI component actually depends on network requests.
- If that happens, configure it in `preview.tsx` and keep it package-local.

## Guidance for AI agents

- Add stories next to the component under `src`.
- Prefer importing icons from `../icons` or `../../icons` within the package, not from `lucide-react`.
- Keep story-only helpers package-local; do not export them from `@repo/ui`.
- If a component already has unit tests, keep Storybook focused on representative states and browser-only behavior rather than repeating static assertions.
- For this package, Storybook play tests should be rare and intentional: coordinated shell behavior, form interaction flows, and browser-only regressions.
- Do not add `data-*` hooks or extra ARIA to components just to make Storybook or tests easier to query. Prefer stable native selectors or visible text unless the attribute is part of the real component contract.
- If a story is only useful as documentation, tag it so it does not run as a Storybook test.
