# AGENTS.md - Signal Tracker

## Project Scope

- Signal Tracker code lives under `apps/analysis/signal-tracker/`.
- Start Signal Tracker work in this project area, then inspect unrelated monorepo areas only when needed for shared package conventions, build/test scripts, or explicit dependencies.
- Do not infer product requirements from unrelated apps in `apps/*`.

## Current Packages

- `signal-tracker-web`: React/Vite frontend using Tailwind CSS, shadcn/ui, and Radix UI for the local Signal Tracker UI foundation.
- `signal-tracker-api`: Lambda-style TypeScript API with a local dev server.
- `signal-tracker-shared`: project-scoped route contracts, schemas, and shared types.
- `signal-tracker-infra`: AWS CDK stack for API and static web deployment.

## UI Architecture

- Use Tailwind CSS as the Signal Tracker styling foundation for spacing, responsive layout, and design-token-driven visual control.
- Use Tailwind responsive utilities for page and layout presentation.
- Use CSS or container queries for reusable component internals when presentation depends on available parent/container size.
- Use shadcn/ui as the default local component layer for common app components. Treat copied shadcn-style primitives as app-owned code.
- Use Radix UI as the accessible primitive layer, usually through shadcn/ui. Use Radix UI directly only when shadcn/ui does not provide the needed primitive or when a Signal Tracker-specific interaction needs lower-level control.
- Tailwind Plus and Catalyst, if used, are reference or pattern sources only, not the controlling design system.
- Signal Tracker UI must not import `@repo/ui`, `packages/ui`, or other styled shared UI packages.
- Keep styled Signal Tracker UI primitives app-local in `signal-tracker-web` until they stabilize through real use across more than one app, or until the user or issue explicitly requests extraction.
- Use `@repo/ui-base` when a UI behavior abstraction is useful, especially for form wiring or other behavior-only primitives.
- Use `@repo/ui-base` responsive hooks only for runtime behavior changes that CSS cannot express. Do not use these hooks as the default styling or layout mechanism.
- Do not create app-local responsive hook duplicates when `@repo/ui-base` already provides the needed behavior.
- Keep generic copy-owned UI primitives product-agnostic in a local web-app layer such as `src/components/ui/`.
- Keep product-specific Signal Tracker components inside `signal-tracker-web`, in a product layer such as `src/components/signal-tracker/`.
- The Signal Tracker product layer should encode topics, entries, assessments, evidence, citations, source previews, uncited state, review state, and related workflows.
- Avoid mixing primitive or component systems for the same interaction type. Do not use shadcn/Radix, raw Radix, Headless UI, MUI, Ant Design, Mantine, or another component library interchangeably for the same dialog, popover, dropdown, tooltip, tab, or collapsible behavior unless a specific exception is documented.
- Prefer narrow, purpose-built component interfaces. Start with only the props the current UI needs, then expand when a concrete caller requires more capability.
- When supported props come straight from a native element, prefer `Pick<>` over manually rewriting each native prop type, then spread only that picked subset onto the underlying element.
- Do not expose full native element prop surfaces, generic prop pass-throughs, or broad accessibility/data/id escape hatches by default. Add those only when they solve a real Signal Tracker implementation problem.
- If Signal Tracker needs a behavior abstraction that belongs in `@repo/ui-base`, extend `@repo/ui-base` with a small, general API and tests instead of duplicating behavior in the app.

## Frontend Data And State

- Keep Signal Tracker UI work app-local unless a behavior abstraction clearly belongs in `@repo/ui-base` or an issue explicitly requires broader shared-package work.
- Use route contracts, request/response schemas, and domain types from `@repo/signal-tracker-shared`; do not duplicate API shapes in the web app.
- Use RTK Query as the server-state layer. Do not store server data or derived server data in standalone Redux slices.
- Async UI must account for loading, error, empty, and success states, even when shared components render those states.
- Normalize API errors through shared app infrastructure as that infrastructure emerges; avoid one-off error shapes and swallowed async failures in feature components.
- Non-trivial forms should be schema-driven, infer TypeScript types from the schema, and use reusable field components rather than repeated manual field wiring.

## Product Source Of Truth

Google Drive holds durable product direction. Use the Google Drive plugin/connector when product context is needed, especially before making implementation decisions that affect behavior, data model, scope, or release sequencing.

### Google Drive Navigation

The canonical Signal Tracker Drive folder is:

- `Signal Tracker`: `https://drive.google.com/drive/folders/16VAZNP9MZSc_yKdZP1shB3ofi0jhPF2e`

When looking for Signal Tracker product context:

- Prefer listing the canonical folder first, then open the relevant docs from that folder.
- If the folder URL is inaccessible or the connector cannot list it, search Google Drive for `Signal Tracker` and prefer results whose title starts with `Signal Tracker`.
- Every durable Signal Tracker product doc should start with `Signal Tracker`. Treat non-prefixed docs as background only unless the user explicitly points to them.
- Use concise Drive search queries such as `Signal Tracker Product Requirements`, `Signal Tracker Project Tracker`, or `Signal Tracker Decisions` instead of long natural-language queries.
- If the Google Drive plugin/connector is not enabled and product context is needed, stop and ask the user to enable the Google Drive plugin before making product-affecting decisions.
- Do not infer product direction from stale local notes when a Drive source-of-truth doc is needed but unavailable. Explain the missing Drive access and proceed only with implementation-neutral repo inspection.

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
- revisions, entry-level soft delete, topic archive, and export
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

## Topic Lifecycle

- Topic archive is the reversible/non-destructive topic lifecycle action. Archived topics are hidden from normal active lists but remain directly readable by ID.
- Topic delete is a permanent hard delete of the topic row. Do not convert topic delete into soft delete unless a future product decision explicitly reverses this.
- Entry lifecycle is separate: entry-level `deleted` status and `deletedAt` fields remain valid where entry provenance or recovery matters.
- Do not add topic-level `deleted` status or `deletedAt` fields, change topic route names, create migrations, or remove dev-DB TODOs as part of lifecycle wording cleanup.

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
