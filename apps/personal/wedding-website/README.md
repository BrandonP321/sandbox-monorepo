# Wedding Website

This project hosts the wedding RSVP frontend, portable RSVP contracts, the
create-only API application, and the single-stack production infrastructure.
Local API development uses in-memory persistence. The production Lambda uses a
DynamoDB repository configured by `RSVP_TABLE_NAME`; it never falls back to
in-memory storage when production configuration is missing.

The frontend maps its locally validated draft through the shared production
contract and submits to the create-only API. Confirmation appears only after a
schema-valid `200` or `201` response. The project has no guest authentication or
messaging services; its unlinked `/admin` route provides protected, read-only
submission access.

The production design and implemented contract are documented in
[PRODUCTION_RSVP_ARCHITECTURE.md](./PRODUCTION_RSVP_ARCHITECTURE.md). That
document remains the source of truth for the shared/API/infra package boundaries
and production data contract.

## Packages

- `wedding-website-web`: React/Vite frontend.
- `wedding-website-shared`: portable RSVP schemas, route contracts,
  normalization, and canonical serialization.
- `wedding-website-api`: create-only RSVP API with local in-memory and production
  DynamoDB repository implementations.
- `wedding-website-infra`: web hosting plus the DynamoDB/Lambda/HTTP API
  resources and single Prod deployment pipeline.

## Run locally

From the repository root, install dependencies and start the project:

```sh
pnpm install
pnpm dev:wedding-website
```

This starts the web app and local in-memory API together. The API listens at
`http://localhost:3001` and exposes only `POST /rsvp`. Restarting it clears all
submissions, and the frontend uses this local endpoint whenever
`VITE_API_BASE_URL` is not set. Local development does not write to production
DynamoDB.

The landing page is served at `/`. The RSVP flow is served at `/RSVP`, where
the current form stage and locally saved draft are restored after reload.

## RSVP behavior

The frontend implements a five-stage guest journey: landing, party and
attendance, additional details, review, and confirmation.

- Adult entries contain a name, independent attendance response, and optional
  email and phone fields. At least one contact method is required across all
  adults before continuing. Additional Details repeats party-level contact,
  independently prefilling email and phone from the first matching adult while
  preserving any party-level edits; at least one party-level method is required.
- Version 5 localStorage persists active pre-submit drafts through Review and,
  while a submit remains unresolved, the attempt's UUID v4 key and canonical
  SHA-256 request fingerprint. The request body is not duplicated in a separate
  attempt record.
- The unresolved attempt is stored before `POST /rsvp` begins. An unchanged
  retry after a network failure, timeout, throttle, retryable server error, or
  refresh reuses the same key. A conflicting or meaningfully changed request
  receives a new key.
- A validated `200` or `201` creates the in-memory Confirmation snapshot and
  clears all pre-submit persistence. Refreshing after Confirmation starts a
  clean `/RSVP` flow.
- Confirmation shows a simple completion message and a Home link. Returning
  home clears the transient submitted snapshot; starting RSVP again opens a
  blank party rather than prepopulating the previous response.
- Submission sends the normalized shared request to the configured create-only
  API with a 10-second client timeout. It sends no email or SMS and provides no
  guest lookup, authentication, contact-based deduplication, or public View/Edit
  RSVP path.

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

The canonical production website is `https://niamhandbrandon.com`, hosted by
CloudFront with a private S3 origin. `https://www.niamhandbrandon.com`
permanently redirects to the apex while preserving the request path and query,
and `https://wedding.bphillips.dev` remains available as a temporary fallback.
The same `WeddingWebsiteStack` defines the production service at
`https://wedding-api.bphillips.dev` using an API Gateway HTTP API, Node.js
Lambdas, and an on-demand DynamoDB table. CORS allows exactly the canonical and
fallback frontend origins with the current public/admin methods and headers; it
is not authentication or abuse prevention.

There are no Dev, Beta, Staging, or Preview deployment stages. The frontend
build receives `VITE_API_BASE_URL` during publishing and uses it as the sole
production API base URL. Read the
[infrastructure README](./wedding-website-infra/README.md) for outputs,
validation, deployment safety, operational verification, and the temporary
quota-blocked omission of RSVP Lambda reserved concurrency. The intended
post-quota reservation remains five.

The purchased domain is registered through Amazon Registrar and delegated to
its existing Route 53 hosted zone. A dedicated DNS-validated ACM certificate in
`us-east-1` covers the apex, `www`, and the fallback hostname so the existing
CloudFront distribution can serve all three aliases. External QR codes,
printed artwork, bookmarks, and wedding communications are not repository-owned
and must be updated manually when appropriate.

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

The app reuses the wedding shared contract and frontend configuration packages
alongside the repository's TypeScript, ESLint, Vitest, and test setup.
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
