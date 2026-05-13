# AGENTS.md — Sandbox Monorepo (Codex/Agent Instructions)

## Purpose

This repo is a personal "app factory": many small tools (econ/analytics/policy support) built quickly with:

- Multiple deployable apps in /apps
- Reusable libraries/config in /packages
- Minimal ceremony, high clarity, low regression risk

## Prime Directive

Assume a human will read, maintain, and debug this code. Optimize for clarity and reviewability over cleverness.

## Repo Layout (high level)

- `apps/*`: deployable applications (web, api, jobs)
- `packages/*`: shared libraries and shared configs (lint/ts/test)

Authoritative map: see REPO_MAP.md.

## Standard Commands (run before declaring "done")

- Install: pnpm install
- Format: pnpm format:check
- Lint: pnpm lint
- Types: pnpm typecheck
- Test: pnpm test
- Build: pnpm build

## Local Tooling Baseline

- Use the Node version from `.nvmrc` at repo root. Current baseline: `24`.
- Use the repo-pinned pnpm version from `packageManager` in `package.json`.
- If `corepack` is unavailable or broken on a machine, install the pinned pnpm version directly rather than changing repo scripts.

## Workflow Contract (how work is done in this repo)

1. Implement in small, reviewable commits.
2. Always add at least one regression guard (unit/integration) for behavioral changes.
3. Keep formatting clean before commit. The repo pre-commit hook runs Prettier on staged files, and Codex should run `pnpm format:check` before declaring work done.
4. Run the standard commands and report results (or failures + next steps).

Details: see WORKFLOW.md.

## L7+ Execution Traits (how to behave)

- Be explicit about assumptions; if ambiguous, propose the smallest shippable interpretation and proceed.
- Prefer standard, boring solutions; avoid bespoke frameworks.
- Keep diffs small; separate refactors from feature changes.
- Minimize dependencies; justify new dependencies explicitly.
- Prefer reuse via `packages/*`; avoid app-local utility sprawl.

## Agent Guidance Maintenance

- Treat corrected assumptions, repeated user guidance, durable implementation conventions, and recurring gotchas as candidates for `AGENTS.md` updates.
- When a user gives guidance that should shape future Codex behavior, update the relevant `AGENTS.md` in the same change when the scope is clear and the guidance is durable.
- Choose the narrowest level that will reliably reach future work:
  - Root `AGENTS.md` for repo-wide engineering workflow, testing, safety, dependency, or collaboration rules.
  - Project or app-level `AGENTS.md` for product, package, deployment, or stack-specific rules.
  - Directory-level `AGENTS.md` for local component, module, or file-organization conventions.
- Add a new, more local `AGENTS.md` when an area has recurring conventions but no existing guidance file at the right scope.
- Do not document one-off task details, stale issue state, secrets, or temporary debugging observations as standing agent guidance.
- If the right scope is unclear, call out the proposed `AGENTS.md` update and the level where it belongs before adding it.

## Reuse / Consolidation Rule (critical)

Before adding new code:

1. Search for an existing implementation in `packages/*`.
2. If the code is likely to be reused across 2+ apps OR will be copied, DO NOT duplicate it.
   - Create/extend a shared package instead and update the app to import it.
3. If unsure, default to creating a small shared helper with a clean API and tests.

Authoritative playbook: see SHARED_CODE_PLAYBOOK.md.

## Frontend Work

- Prefer simple, explicit React/TypeScript components over clever abstractions, deep indirection, or speculative flexibility.
- Keep feature files cohesive. Treat roughly 100 lines as a decomposition review trigger, not a hard limit; split only when a clearer component, hook, helper, schema, or test fixture boundary appears.
- Avoid unnecessary `useEffect`, stored derived state, broad context providers, premature Redux/global state, and raw `fetch` calls inside components.
- Keep TypeScript strict. Avoid `any`; use `unknown`, schemas, type guards, discriminated unions, and exhaustive checks when they fit the problem.
- Test user-visible behavior and accessibility-facing semantics. Do not make tests a weakly typed zone.
- Use the app or package's existing UI stack before adding dependencies, new component systems, or duplicate primitives.

## Unit Testing

- Apply the 80/20 rule: write the smallest set of tests likely to catch most regressions in the touched behavior, and avoid broad assertions that only restate implementation details.
- Prefer behavior and contract tests over prop plumbing, class names, private structure, or framework behavior. For UI, assert what users can perceive or operate; for APIs and domain code, assert request/response contracts, state transitions, validation, and error behavior.
- Keep simple tests direct and readable. Do not introduce test helper functions, utility classes, or custom render wrappers until duplication is real and the abstraction makes the test easier to understand.
- When test setup is repeated, prefer small file-local setup functions or typed fixtures first. Promote shared helpers only after the same pattern appears across multiple files and has a stable, narrow API.
- Strongly type test fixtures and helper inputs when they represent public contracts, shared schemas, API request/response bodies, domain objects, generated types, or other shapes that should fail fast when the production contract changes. Use `satisfies`, exported contract/domain types, or schema-inferred types to keep fixture literals checked without unnecessarily widening them.
- Keep intentionally invalid fixtures untyped or typed as `unknown` when the test is proving runtime validation, parser rejection, or defensive narrowing. Do not weaken a negative test just to satisfy a compile-time contract that the fixture is supposed to violate.
- Avoid brittle copy duplication. If a label, status, or description is reused as a stable product string, consider exporting it from feature code and importing it in tests; when exact copy is the behavior under test, assert the literal text intentionally.
- Keep tests focused on one meaningful outcome. A regression guard should fail for a reason a maintainer can act on quickly.

## Dependency Direction (do not violate)

- `apps/*` MAY depend on `packages/*`
- `packages/*` MUST NOT depend on `apps/*`
- shared packages should avoid depending on other shared packages unless justified (keep layering simple)

## Safety

- Never commit secrets. Use environment variables; later integrate AWS-native secret storage.
- Do not run destructive commands (rm -rf, delete resources, terraform destroy, etc.) without explicit user confirmation.

## AWS Deployment Conventions

- Use AWS IAM Identity Center / SSO for human and Codex-driven access. Do not use root credentials for daily work.
- Standard local AWS CLI profile: `sandbox-admin`
- Standard AWS region for this repo today: `us-east-1`
- Current shared AWS account for repo deployments: `498283327683`
- Before deploy/debug work on a fresh machine, verify access with `aws sso login --profile sandbox-admin` and `aws sts get-caller-identity --profile sandbox-admin`.
- For non-interactive CDK deploys in Codex sessions, prefer `cdk deploy --require-approval never` so IAM-related prompts do not block the run.

## When you need more context

Consult these files first:

- docs/WORKFLOW.md (standard development loop)
- docs/REPO_MAP.md (where to put things)
- docs/SHARED_CODE_PLAYBOOK.md (how to factor shared code)
- packages/dashboard-ui/README.md (shared dashboard UI package contract and direction)
- packages/ui-base/README.md (shared UI behavior package contract and direction)

## Project-Specific Agent Guidance

- Signal Tracker work is scoped to `apps/analysis/signal-tracker/` unless an issue explicitly requires repo-wide changes or shared package context.
- Before substantive Signal Tracker implementation work, read `apps/analysis/signal-tracker/AGENTS.md`.
- Signal Tracker product direction lives in Google Drive. Use the Google Drive plugin/connector when product context is needed, following the Drive navigation rules in `apps/analysis/signal-tracker/AGENTS.md`.
- Signal Tracker GitHub Issues are build-ready feature specs; the GitHub Project named `Signal Tracker` tracks execution.
- Signal Tracker UI may import `@repo/dashboard-ui` for reusable dashboard primitives and `@repo/ui-base` for behavior abstractions. Keep Signal Tracker-specific UI components inside `signal-tracker-web`.
- Signal Tracker work should keep a senior-SDE refactoring posture: look for duplication, weak boundaries, and reusable abstractions as implementation proceeds; make small sustainability refactors when they are needed for the task, and extend shared packages only when the abstraction is general enough and tested.

## UI package note

- `packages/dashboard-ui` is the shared dashboard-oriented React primitive and style package.
- `packages/ui-base` is the shared behavior-only UI helper package.
- Prefer extending tokens, shared styles, and small owned primitives over introducing a large UI framework by default.
- Do not assume dark mode support unless explicitly requested.
