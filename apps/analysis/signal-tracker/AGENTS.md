# AGENTS.md - Signal Tracker

## Project Scope

- Signal Tracker code lives under `apps/analysis/signal-tracker/`.
- Start Signal Tracker work in this project area, then inspect unrelated monorepo areas only when needed for shared package conventions, build/test scripts, or explicit dependencies.
- Do not infer product requirements from unrelated apps in `apps/*`.

## Current Packages

- `signal-tracker-web`: React/Vite frontend. This scaffold intentionally uses native HTML elements and local CSS.
- `signal-tracker-api`: Lambda-style TypeScript API with a local dev server.
- `signal-tracker-shared`: project-scoped route contracts, schemas, and shared types.
- `signal-tracker-infra`: AWS CDK stack for API and static web deployment.

## UI Architecture

- Signal Tracker UI must not import `@repo/ui`, `packages/ui`, or other styled shared UI packages.
- Use `@repo/ui-base` when a UI behavior abstraction is useful, especially for form wiring or other behavior-only primitives.
- Create Signal Tracker-specific UI components inside `signal-tracker-web`; keep their markup, styling, and product-specific composition app-local.
- Keep visual styling in `signal-tracker-web` local CSS unless a later issue explicitly changes the UI architecture.
- If Signal Tracker needs a behavior abstraction that belongs in `@repo/ui-base`, extend `@repo/ui-base` with a small, general API and tests instead of duplicating behavior in the app.

## Product Source Of Truth

Google Drive holds durable product direction. Use the Google Drive plugin/connector when product context is needed, especially before making implementation decisions that affect behavior, data model, scope, or release sequencing.

Current Signal Tracker source-of-truth docs:

- `Signal Tracker - Project Charter`
- `Signal Tracker - Product Requirements Document`
- `Signal Tracker - Project Tracker`
- `Signal Tracker - Product Decisions Log`
- `Signal Tracker - Domain Glossary & Data Model ADR`
- `Signal Tracker - Validation Plan`
- `Signal Tracker - GitHub Issue Feature Spec Template`

Research input docs may be useful background, but they are not current sources of truth:

- `Product Discovery Report for a Public Affairs Continuity App`
- `Signal Tracker deep review`

## Execution Workflow

- GitHub Issues are the system of record for build-ready feature specs.
- The GitHub Project named `Signal Tracker` tracks execution.
- Pull requests preserve implementation and review history; link PRs back to the issue when possible.
- If implementation uncovers a durable product decision, update the appropriate Google Drive doc or flag `Docs Update Needed` in the issue/PR. Do not leave durable product decisions only in issue comments, PR comments, or local repo notes.

## R1 MVP Frame

R1 MVP is `Manual Evidence-Backed Dossier`.

Keep R1 work focused on manual, structured continuity:

- topics and framing questions
- event entries, assessment updates, and review notes
- reusable evidence, anchors, and citations
- current assessment derived from assessment history
- since-last-review workflow
- revisions, soft delete/archive, and export
- hidden scaffolding for future suggestions only when specified

Deferred from R1 unless the Product Decisions Log changes:

- user-facing AI suggestions, summaries, autonomous updates, or retrieval
- ingestion, RSS, news APIs, source watchlists, custom alerts, or attention overlays
- source comparison, source bias scoring, social ingestion, or multi-feed dashboards
- public publishing, team workspaces, comments, roles, permissions, or assignment workflows
- first-class claims, first-class assumptions, calibration, graph views, or entity linking UI

## Shared Code

- Prefer `signal-tracker-shared` for project-scoped contracts, schemas, and types used by 2+ Signal Tracker packages.
- Promote code to repo-wide `packages/*` only when it is useful across multiple app families or the issue explicitly requires a repo-wide package.
- Keep dependency direction intact: Signal Tracker packages may depend on `packages/*`; `packages/*` must not depend on Signal Tracker packages.

## Engineering Sustainability

- Treat each issue as a chance to improve the shape of the code, not only to add the narrow behavior requested.
- While implementing, actively look for duplicated logic, unclear module boundaries, oversized components, missing domain types, and utilities that would make the next feature easier to build safely.
- Make small refactors inside the touched area when they clarify the implementation, remove meaningful duplication, or prevent brittle growth.
- If a needed abstraction belongs in `signal-tracker-shared`, `@repo/ui-base`, or another shared package Signal Tracker already uses, add it there with tests and update callers instead of growing app-local utility sprawl.
- Keep these refactors reviewable: separate unrelated rewrites, avoid broad churn, and call out follow-up opportunities when a useful cleanup is larger than the current issue should carry.

## Local Commands

- Web dev server: `pnpm --filter signal-tracker-web dev`
- API dev server: `pnpm --filter signal-tracker-api dev`
- Web checks: `pnpm --filter signal-tracker-web lint`, `typecheck`, `test`, `build`
- API checks: `pnpm --filter signal-tracker-api lint`, `typecheck`, `test`, `build`
- Shared checks: `pnpm --filter @repo/signal-tracker-shared lint`, `typecheck`, `test`, `build`
- Infra checks: `pnpm --filter signal-tracker-infra lint`, `typecheck`, `test`, `build`, `synth`
- Root repo commands remain defined in `docs/WORKFLOW.md`.

## Documentation Boundaries

- Repo docs should route agents to the right context and implementation scope.
- Do not duplicate the PRD or Project Tracker in repo markdown; point to Google Drive docs instead.
