# @repo/ui-base

Behavior-first UI primitives for sandbox apps.

## Purpose

`@repo/ui-base` owns reusable UI behavior that should survive across multiple
designed UI packages.

The package starts with form infrastructure and RHF-backed form controls:

- `Form`
- `FormProvider`
- `useFormField`
- `FormInputControl`
- `FormDropdownControl`
- `FormCheckboxGroupControl`
- `FormRadioGroupControl`
- `useDebouncedValue`

These exports do not ship styles or field chrome. Designed packages such as
`@repo/ui` inject their own rendering components and keep ownership of layout,
icons, labels, options, comparison logic, and visual treatment. The current
control contracts are intentionally small and functional-only. Each control
uses a `children` render function to hand resolved field props into the
designed component rather than exposing a large native prop surface.

Shared type helpers for these render contracts live in
[`src/components/FormControl.types.ts`](./src/components/FormControl.types.ts).

## Direction

- Keep the public contracts small and obvious.
- Prefer reusable behavior over package-specific styling concerns.
- Add new controls incrementally and validate them in a designed package before
  migrating the next pair.
- Keep plain, non-RHF controls in the designed package unless there is a clear
  behavior contract worth reusing across multiple design systems.
- Keep shared hooks behavior-only, style-free, and independent of any one app's
  domain model.
