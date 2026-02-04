# Sandbox Monorepo

Personal monorepo for rapidly building small internal tools (econ/analytics/policy support).
Default approach: multiple apps in /apps and reusable code/config in /packages.

## Stack
- Node + TypeScript
- pnpm workspaces
- Turborepo task runner
- Mantine UI (design system for web apps)

## Repo Layout
- apps/*/*: deployable apps (web, api, infra) grouped by collection
- packages/*: shared libraries and shared configs

See REPO_MAP.md for details.

## Quickstart
1) Enable pnpm via Corepack (recommended) and install:
   - pnpm install
2) Run tasks:
   - pnpm dev
   - pnpm dev:hello (web + api only)
   - pnpm test
   - pnpm lint
   - pnpm typecheck
   - pnpm build

## How work gets done here
Agent/Codex guidance lives in AGENTS.md.
