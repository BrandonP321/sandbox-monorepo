# Sandbox Monorepo – Agent Instructions (AGENTS.md)

## Goals
- Fast iteration for personal apps.
- Prefer simple, standard patterns.
- Assume a human will read and maintain the code.

## Repo Layout
- apps/*: deployable applications (web, api, jobs)
- packages/*: shared libraries and configs

## Commands (always run before declaring done)
- Install: pnpm install
- Lint: pnpm lint
- Typecheck: pnpm typecheck
- Test: pnpm test
- Build: pnpm build

## Engineering Tenets
- Small, reviewable diffs.
- Avoid adding dependencies unless clearly justified.
- Never commit secrets. Prefer env vars and AWS-native secret storage later.
- Do not run destructive commands without explicit confirmation.

## Conventions
- Use turbo tasks, not ad-hoc scripts.
- Keep app-specific env files inside the app package when we add them.
