# Signal Tracker

Signal Tracker is the analysis app family for maintaining evidence-backed continuity on public-affairs topics. Its R1 MVP is a Manual Evidence-Backed Dossier: a solo-user workflow for topics, dated entries, assessment history, reusable evidence, citations, review loops, and export.

This repo should stay implementation-focused. Product direction belongs in Google Drive; build-ready specs belong in GitHub Issues.

## Packages

- `signal-tracker-web`: React/Vite frontend with native HTML elements and local CSS.
- `signal-tracker-api`: Lambda-style TypeScript API with a local dev server.
- `signal-tracker-shared`: project-scoped route contracts, schemas, and shared types.
- `signal-tracker-infra`: AWS CDK deployment package.

Use `signal-tracker-shared` before promoting Signal Tracker-only contracts to repo-wide `packages/*`.

## UI Architecture

Signal Tracker should use `@repo/ui-base` for shared behavior abstractions only. Do not import `@repo/ui` or other styled shared UI packages into Signal Tracker. Product-specific UI components belong inside `signal-tracker-web`, with local markup and CSS.

When a behavior abstraction becomes reusable enough, promote it into `@repo/ui-base` with a small API and tests rather than copying behavior across Signal Tracker components.

## Engineering Posture

Implementation work should keep improving the code shape as the project grows. While working on feature issues, look for duplicated logic, weak boundaries, oversized components, reusable types, and shared behavior that should move into `signal-tracker-shared`, `@repo/ui-base`, or another shared package already used by Signal Tracker.

Keep these refactors small and reviewable. Do the cleanup needed to make the current task sustainable; document larger follow-up refactors when they are valuable but not appropriate for the current issue.

## Product Context

Use the Google Drive plugin/connector to read current product docs when product context is needed:

- `Signal Tracker - Project Charter`
- `Signal Tracker - Product Requirements Document`
- `Signal Tracker - Project Tracker`
- `Signal Tracker - Product Decisions Log`
- `Signal Tracker - Domain Glossary & Data Model ADR`
- `Signal Tracker - Validation Plan`
- `Signal Tracker - GitHub Issue Feature Spec Template`

The GitHub Project named `Signal Tracker` tracks execution. GitHub Issues are the system of record for build-ready feature specs. Durable product decisions discovered during implementation should be reflected back into Drive docs or flagged as `Docs Update Needed`.

## R1 Boundaries

R1 is manual, structured continuity with low-friction evidence capture. It is not an AI/news monitoring release.

Deferred from R1 unless the Product Decisions Log changes:

- user-facing AI, autonomous updates, AI summaries, or retrieval
- RSS/news ingestion, alerts, attention overlays, source comparison, or social monitoring
- team collaboration, public publishing, permissions, or assignment workflow
- source bias scoring, calibration, graph views, and first-class claims/assumptions

## Local Development

Run the API and web app in separate terminals:

```bash
pnpm --filter signal-tracker-api dev
pnpm --filter signal-tracker-web dev
```

The API defaults to `http://localhost:3001`. The web app loads `/config.json` in deployment and defaults to the local API during development when runtime config is missing.

## Postman

Signal Tracker Postman collections and environments are generated from route configs in this repo:

```bash
pnpm postman:generate --project signal-tracker
pnpm postman:validate --project signal-tracker
pnpm postman:run --project signal-tracker --env local
pnpm postman:sync --project signal-tracker
```

`postman:sync` reads `POSTMAN_API_KEY` from the shell or from a repo-root `.env.local` file. `.env.local` is ignored by git and must not be committed.
