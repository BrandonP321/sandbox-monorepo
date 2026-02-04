# AGENTS.md — Sandbox Monorepo (Codex/Agent Instructions)

## Purpose
This repo is a personal "app factory": many small tools (econ/analytics/policy support) built quickly with:
- Multiple deployable apps in /apps
- Reusable libraries/config in /packages
- Minimal ceremony, high clarity, low regression risk

## Prime Directive
Assume a human will read, maintain, and debug this code. Optimize for clarity and reviewability over cleverness.

## Repo Layout (high level)
- apps/*: deployable applications (web, api, jobs)
- packages/*: shared libraries and shared configs (lint/ts/test)

Authoritative map: see REPO_MAP.md.

## Standard Commands (run before declaring "done")
- Install: pnpm install
- Lint:    pnpm lint
- Types:   pnpm typecheck
- Test:    pnpm test
- Build:   pnpm build

## Workflow Contract (how work is done in this repo)
1) Every change starts from a Task Brief (use TASK_BRIEF_TEMPLATE.md).
2) Implement in small, reviewable commits.
3) Always add at least one regression guard (unit/integration) for behavioral changes.
4) Run the standard commands and report results (or failures + next steps).

Details: see WORKFLOW.md.

## L7+ Execution Traits (how to behave)
- Be explicit about assumptions; if ambiguous, propose the smallest shippable interpretation and proceed.
- Prefer standard, boring solutions; avoid bespoke frameworks.
- Keep diffs small; separate refactors from feature changes.
- Minimize dependencies; justify new dependencies explicitly.
- Prefer reuse via packages/*; avoid app-local utility sprawl.

## Reuse / Consolidation Rule (critical)
Before adding new code:
1) Search for an existing implementation in packages/*.
2) If the code is likely to be reused across 2+ apps OR will be copied, DO NOT duplicate it.
   - Create/extend a shared package instead and update the app to import it.
3) If unsure, default to creating a small shared helper with a clean API and tests.

Authoritative playbook: see SHARED_CODE_PLAYBOOK.md.

## Dependency Direction (do not violate)
- apps/* MAY depend on packages/*
- packages/* MUST NOT depend on apps/*
- shared packages should avoid depending on other shared packages unless justified (keep layering simple)

## Safety
- Never commit secrets. Use environment variables; later integrate AWS-native secret storage.
- Do not run destructive commands (rm -rf, delete resources, terraform destroy, etc.) without explicit user confirmation.

## When you need more context
Consult these files first:
- docs/WORKFLOW.md (standard development loop)
- docs/REPO_MAP.md (where to put things)
- docs/SHARED_CODE_PLAYBOOK.md (how to factor shared code)
