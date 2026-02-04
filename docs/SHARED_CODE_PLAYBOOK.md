# SHARED_CODE_PLAYBOOK.md — Reuse-first engineering

Goal: prevent copy/paste and keep apps thin. Shared packages are a force multiplier.

## The Reuse Trigger (when to consolidate)
Consolidate into packages/* when ANY is true:
1) You are about to copy code across files/apps.
2) The same concept appears in 2+ apps (even with small differences).
3) The code is a "domain primitive" (e.g., time-series normalization, inflation adjustment utilities, data validation schemas).
4) The code is tricky/bug-prone and deserves one canonical implementation.

If uncertain, default to extracting a small shared helper with tests.

## What NOT to extract (yet)
- One-off glue code tightly bound to a single app’s UI routing
- Premature abstractions with unclear API shape
- Highly app-specific styling/layout

## Extraction workflow (repeatable)
1) Identify the minimal stable API.
   - Prefer small functions with explicit inputs/outputs.
   - Avoid global state; avoid implicit env dependencies.

2) Choose the destination package:
   - packages/shared: pure TS utilities (no I/O)
   - packages/data: ingestion/parsing/adapters + validation
   - packages/api-contracts: schemas/types shared by UI/API
   - packages/ui: reusable components/hooks

3) Add tests at the package level.
   - If a bug prompted extraction, add a regression test for it.

4) Replace app-local implementation with imports from the package.

5) Keep dependencies minimal.
   - If adding a dependency to a shared package, it affects many apps.
   - Justify any new dependency explicitly.

## Contract-first (especially for web/api pairs)
- Define DTOs and validation schemas in packages/api-contracts.
- Both web and api import the contract.
- Prefer runtime validation (e.g., zod) for external inputs.

## Performance and ergonomics
- Prefer predictable, readable code over micro-optimizations.
- If a shared abstraction adds indirection, ensure it reduces total code and reduces future bug risk.

## Human-readability rules (non-negotiable)
- Clear naming > cleverness.
- Prefer explicit types at package boundaries.
- Document intent and invariants in docstrings where it matters.

## Escalation rule
If you find 3+ similar implementations emerging, stop and consolidate immediately.
