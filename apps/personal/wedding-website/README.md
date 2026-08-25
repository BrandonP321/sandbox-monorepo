# Wedding Website

This project hosts the wedding RSVP frontend, its static production
infrastructure, portable production RSVP contracts, and the first local API
application foundation. The API currently uses in-memory persistence for local
development only; DynamoDB and production API infrastructure remain deferred.

The August 26, 2026 target is for a usable prototype, not production readiness.
The current frontend milestone uses fictional, local-only data and does not yet
call the API. The project has no production database, guest authentication,
admin tooling, or messaging services.

The implementation-ready design for the later create-only production backend
is documented in
[PRODUCTION_RSVP_ARCHITECTURE.md](./PRODUCTION_RSVP_ARCHITECTURE.md). That
document defines the future shared/API/infra package boundaries and production
data contract; it does not mean those resources exist yet.

## Packages

- `wedding-website-web`: React/Vite frontend.
- `wedding-website-shared`: portable RSVP schemas, route contracts,
  normalization, and canonical serialization.
- `wedding-website-api`: create-only RSVP API application with local in-memory
  persistence.
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

Start the local in-memory API separately at `http://localhost:3001`:

```sh
pnpm --filter wedding-website-api dev
```

It exposes only `POST /rsvp`. Restarting the process clears all submissions,
and the frontend does not call this endpoint until the later integration issue.

The landing page is served at `/`. The RSVP flow is served at `/RSVP`, where
the current form stage and locally saved draft are restored after reload.

## RSVP prototype behavior

The frontend implements a five-stage guest journey: landing, party and
attendance, additional details, review, and confirmation.

- Adult entries contain a name, independent attendance response, and optional
  email and phone fields. At least one contact method is required across all
  adults before continuing. Additional Details repeats party-level contact,
  independently prefilling email and phone from the first matching adult while
  preserving any party-level edits; at least one party-level method is required.
- Version 4 localStorage persists only active pre-submit drafts through Review.
  Submitting creates an in-memory confirmation snapshot and clears draft
  persistence; refreshing after Confirmation starts a clean `/RSVP` flow.
- Confirmation shows a simple completion message and a Home link. Returning
  home clears the transient submitted snapshot; starting RSVP again opens a
  blank party rather than prepopulating the previous response.
- Submission is a local-only prototype transition. It makes no network request,
  sends no email or SMS, and provides no guest lookup, authentication,
  deduplication, or public View/Edit RSVP path.

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

pnpm --filter @repo/wedding-website-shared lint
pnpm --filter @repo/wedding-website-shared typecheck
pnpm --filter @repo/wedding-website-shared test
pnpm --filter @repo/wedding-website-shared build

pnpm --filter wedding-website-api lint
pnpm --filter wedding-website-api typecheck
pnpm --filter wedding-website-api test
pnpm --filter wedding-website-api build

pnpm --filter wedding-website-infra lint
pnpm --filter wedding-website-infra typecheck
pnpm --filter wedding-website-infra test
pnpm --filter wedding-website-infra build
pnpm --filter wedding-website-infra synth
```

The repository-wide formatting check is `pnpm format:check`. The normal scoped
project build is `pnpm build:project wedding-website`.

## Production hosting

The production-only environment uses `wedding.bphillips.dev`, private S3, and
CloudFront. It intentionally has no Dev, Beta, Staging, or Preview deployment
stages. The production hostname is configured only when the app is intended to
receive traffic, so it does not have a separate HTTP authentication gate. Read
the [infrastructure README](./wedding-website-infra/README.md) for architecture,
deployment bootstrap, and validation procedures.

Do not deploy or configure `niamhandbrandon.com` as part of this stack.
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
and production architecture context lives in
[PRODUCTION_RSVP_ARCHITECTURE.md](./PRODUCTION_RSVP_ARCHITECTURE.md), the
[frontend prototype and Codex handoff](https://docs.google.com/document/d/1BXn-lBbuD5DzEX_Ygy6GLWTzRtTS4bCFKLlHEduqvFo/edit)
and the
[continuity tracker](https://docs.google.com/document/d/1WC4r9dEEFcd0OynZLyRYlo2-up_iP6qeKkuCpLjhGdM/edit).
