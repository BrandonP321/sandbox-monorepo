# Wedding Website

This project will host a frontend-only wedding RSVP prototype. The current
package is intentionally a minimal scaffold; wedding design, asset preparation,
and RSVP behavior belong to later issues.

The August 26, 2026 target is for a usable prototype, not production readiness.
The current milestone uses fictional, local-only data and has no production
backend, authentication, messaging, or deployment services.

## Run locally

From the repository root, install dependencies and start the project:

```sh
pnpm install
pnpm dev:project wedding-website
```

The package can also be started directly with
`pnpm --filter wedding-website-web dev`.

## Verify

Run the package-scoped checks from the repository root:

```sh
pnpm --filter wedding-website-web lint
pnpm --filter wedding-website-web typecheck
pnpm --filter wedding-website-web test
pnpm --filter wedding-website-web build
```

The repository-wide formatting check is `pnpm format:check`. The normal scoped
project build is `pnpm build:project wedding-website`.

## Frontend foundation

The app uses a small, plain-CSS foundation rather than a general component
framework:

- Central color, spacing, width, radius, motion, and typography variables live
  in `wedding-website-web/src/styles/tokens.css`.
- App-local accessible controls and layout primitives live in
  `wedding-website-web/src/components/ui`.
- Decorative artwork must use the separate `DecorativeLayer` convention and
  must not carry content or interaction.
- Exact production fonts remain deferred. The current semantic roles map to
  provisional Georgia, Snell Roundhand/Brush Script, and system-UI fallback
  stacks so each role can be replaced centrally.

No runtime dependencies were added for this foundation. The app continues to
reuse the repository's TypeScript, ESLint, Vitest, and test-setup packages.
`@repo/dashboard-ui` is intentionally excluded because it owns a dashboard and
Tailwind visual language. `@repo/ui-base` is also deferred: its current form
surface depends on React Hook Form, Redux Toolkit, Zod, and related behavior
that this local-only foundation does not need.

## Project context

Read [AGENTS.md](./AGENTS.md) before making project changes. Canonical product
context lives in the
[frontend prototype and Codex handoff](https://docs.google.com/document/d/1BXn-lBbuD5DzEX_Ygy6GLWTzRtTS4bCFKLlHEduqvFo/edit)
and the
[continuity tracker](https://docs.google.com/document/d/1WC4r9dEEFcd0OynZLyRYlo2-up_iP6qeKkuCpLjhGdM/edit).
