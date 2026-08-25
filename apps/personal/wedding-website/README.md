# Wedding Website

This project hosts a frontend-only wedding RSVP prototype and its protected
static-preview infrastructure. Wedding design and RSVP behavior stay in the web
package; hosting and CI/CD stay in the infra package.

The August 26, 2026 target is for a usable prototype, not production readiness.
The current milestone uses fictional, local-only data and has no backend,
product authentication, database, admin tooling, or messaging services. The
temporary site-wide Basic Auth gate exists only to keep the static preview
private while development continues.

## Packages

- `wedding-website-web`: React/Vite frontend.
- `wedding-website-infra`: private S3/CloudFront hosting and the single Prod
  deployment pipeline.

## Run locally

From the repository root, install dependencies and start the project:

```sh
pnpm install
pnpm dev:project wedding-website
```

The package can also be started directly with
`pnpm --filter wedding-website-web dev`.

For phone or tablet testing on the same Wi-Fi network, start the LAN server:

```sh
pnpm dev:project:lan wedding-website
```

The command binds Vite to the local network interface and prints both the phone
URL and a QR code. Stop any existing wedding-site dev server first because the
LAN server uses the same port (`5173`).

## Verify

Run the package-scoped checks from the repository root:

```sh
pnpm --filter wedding-website-web lint
pnpm --filter wedding-website-web typecheck
pnpm --filter wedding-website-web test
pnpm --filter wedding-website-web build

pnpm --filter wedding-website-infra lint
pnpm --filter wedding-website-infra typecheck
pnpm --filter wedding-website-infra test
pnpm --filter wedding-website-infra build
pnpm --filter wedding-website-infra synth
```

The repository-wide formatting check is `pnpm format:check`. The normal scoped
project build is `pnpm build:project wedding-website`.

## Protected preview hosting

The prepared production-only environment uses `wedding.bphillips.dev`, private
S3, CloudFront, and a viewer-request Basic Auth gate. It intentionally has no
Dev, Beta, Staging, or Preview deployment stages. Read the
[infrastructure README](./wedding-website-infra/README.md) for architecture,
secret bootstrap/rotation, validation, and eventual gate-removal procedures.

Do not deploy or configure `niamhandbrandon.com` as part of this preview stack.
That domain is reserved for a later launch step.

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
