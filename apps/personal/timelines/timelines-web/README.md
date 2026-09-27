# Timelines interface prototype

Interactive local proof for [issue #103](https://github.com/BrandonP321/sandbox-monorepo/issues/103).
This is synthetic data and session-only state. Reloading resets entries, types,
composition, share selections, and revisions. There is no backend or deployment.

From the repository root, use Node 24 and the pinned pnpm:

```sh
pnpm install
pnpm dev:project timelines
```

Open <http://127.0.0.1:5178>. For a phone on the same trusted local network:

```sh
pnpm --filter timelines-web dev --host 0.0.0.0
```

Open the printed network address on the phone. This only serves the disposable
prototype. No AWS credentials or environment variables are needed.

Try these paths:

1. Zoom, pan with the ruler or horizontal wheel, use arrow keys on the timeline,
   jump to a year, and fit the view. Open a group to inspect its entries.
2. Search for **declaration**. Open the entry, inspect the unavailable-image
   fallback and source impact, then edit its title or explicit date fields.
3. Open **Manage sources**. Remove the direct Voices of reform inclusion; it
   remains present through A contested democracy. Remove both inclusions to
   exclude it without deleting its source entries.
4. Rename a type in **Type library** and inspect the updated entry/filter labels.
5. Open **Review changes** to preview/apply a named batch, undo it, or restore an
   individual edit. A newer edit prevents restoring over it.
6. Choose sources in **Share preview**. The read-only preview omits unselected
   sources and owner controls. A newly included source starts private.
7. Use **Prototype lab** for 10,000 entries, sparse BCE/CE dates, an empty timeline,
   and loading/error states. Phones default to the chronological list.

Run package checks with `pnpm --filter timelines-web test` and
`pnpm --filter timelines-web typecheck`. Standard root checks include this package.

See [design and review record](../docs/interface-prototype.md) for tokens,
component boundaries, test evidence, budgets, limitations, and owner acceptance.
