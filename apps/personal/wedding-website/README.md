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

## Project context

Read [AGENTS.md](./AGENTS.md) before making project changes. Canonical product
context lives in the
[frontend prototype and Codex handoff](https://docs.google.com/document/d/1BXn-lBbuD5DzEX_Ygy6GLWTzRtTS4bCFKLlHEduqvFo/edit)
and the
[continuity tracker](https://docs.google.com/document/d/1WC4r9dEEFcd0OynZLyRYlo2-up_iP6qeKkuCpLjhGdM/edit).
