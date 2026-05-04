# AGENTS.md - signal-tracker-web ui primitives

Also follow `../AGENTS.md` for component interface rules, product boundaries, and Storybook/test expectations.

## Directory Layout

- Keep each standalone primitive in its own PascalCase folder, such as `Button/`, `Badge/`, or `DropdownMenu/`.
- Keep tightly related primitive families in one folder when they share ownership or are normally consumed together. For example, `Form/` owns `FormField`, `FormInput`, `FormSelect`, and `FormTextarea`; `Dialog/` owns `DialogContext`.
- Keep each component's implementation, tests, and stories together in the owning folder.
- Add an `index.ts` file to each component folder and export only the intentional public surface for that primitive or family.
- Keep `src/components/ui/index.ts` as the app-facing barrel that re-exports component-folder public APIs.

## Import Boundaries

- Product components may import generic primitives from `@/components/ui`.
- UI primitive implementations should import sibling primitives from their folder barrels, such as `../Button`, instead of importing through the root `@/components/ui` barrel.
- Keep private helper files inside the owning folder. Export helpers from that folder only when another primitive or product component has a concrete need for them.

## Dialogs

- Prefer uncontrolled `Dialog` state for normal modal flows. Put a lightweight child component inside `Dialog` when the flow needs `useDialogContext()` for close or confirm behavior.
- `runDialogConfirm` returns an explicit success/failure result and keeps the dialog open on failure. Use the returned `ok` state for dialog control flow; for API-backed forms, prefer the standardized RTK Query hook `errorMessage` as the rendered inline error source instead of duplicating submit-error state in the dialog.
