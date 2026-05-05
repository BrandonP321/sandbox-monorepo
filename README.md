# Sandbox Monorepo

Personal monorepo for rapidly building small internal tools (econ/analytics/policy support).
Default approach: multiple apps in /apps and reusable code/config in /packages.

## Stack

- Node + TypeScript
- pnpm workspaces
- Turborepo task runner
- Shared local UI foundation in `packages/ui` built incrementally with SCSS tokens and local React primitives

## Local Prerequisites

- Node `24` via the repo-root [`.nvmrc`](/c:/Users/brand/code/personal/sandbox-monorepo/.nvmrc:1)
- pnpm `10.28.2` (from the repo `packageManager` field)
- AWS CLI v2 if you need to deploy CDK stacks

For a fresh machine:

1. Switch to Node `24`.
2. Enable pnpm via `corepack`, or install `pnpm@10.28.2` directly if `corepack` is not working on that machine.
3. Run `pnpm install`.

The repo enforces Node `24` before install and standard scripts. If a command
fails with a Node version error, switch the active shell to Node `24` and rerun:

- macOS/Linux: `nvm use`, `fnm use`, or your Node manager equivalent
- Windows: `nvm use 24` or ensure Node `24` appears first on `PATH`
- Codex cloud/local: select or install Node `24` in the active environment

To check the active runtime directly:

```bash
pnpm check:node
```

## AWS Deploy Setup

This repo currently standardizes on:

- AWS account: `498283327683`
- AWS region: `us-east-1`
- AWS CLI profile: `sandbox-admin`
- Auth mode: AWS IAM Identity Center / SSO

On a fresh machine, configure AWS CLI SSO before attempting deployment:

- `aws configure sso`
- `aws sso login --profile sandbox-admin`
- `aws sts get-caller-identity --profile sandbox-admin`

## Repo Layout

- `apps/*/*`: deployable apps (web, api, infra) grouped by collection
- `packages/*`: shared libraries and shared configs

See REPO_MAP.md for details.

## Quickstart

1. Enable pnpm via Corepack (recommended) and install:
   - pnpm install
2. Run tasks:
   - pnpm dev
   - pnpm dev:hello (web + api only)
   - pnpm dev:signal-tracker:lan (web + api for another device on the same network)
   - pnpm test
   - pnpm lint
   - pnpm typecheck
   - pnpm build

For local phone/tablet testing, use the LAN dev script for the project. It
detects this machine's LAN IP, binds the Vite dev server to the network, and
points the web app at the locally running API through `VITE_API_BASE_URL`:

```bash
pnpm dev:signal-tracker:lan
```

If the detected IP is not the one your device can reach, override it:

```bash
LAN_DEV_IP=192.168.1.50 pnpm dev:signal-tracker:lan
```

## How work gets done here

Agent/Codex guidance lives in AGENTS.md.

## Hello World Deploy

The current CDK-backed example app is `hello-world`.

For the first deploy in an account/region:

- `pnpm --filter hello-world-infra exec cdk bootstrap aws://498283327683/us-east-1`

For Codex or any other non-interactive terminal:

- `pnpm --filter hello-world-infra run deploy:ci`

## Hello World CI/CD

`hello-world` now uses a hybrid CI/CD model:

- GitHub Actions owns monorepo-aware triggering and starts the AWS pipeline.
- AWS CodePipeline owns validation and the Prod deployment flow.

The workflow only runs when a change touches `apps/portfolio/hello-world/**` or any path outside `apps/**`.
Pushes to `main` start the `hello-world-prod` pipeline with the exact Git commit SHA. The detailed validation and deploy logs now live in CodePipeline/CodeBuild instead of GitHub Actions.

One-time setup after deploying `hello-world-infra`:

1. Open the AWS CodeConnections console in `us-east-1` and finish the `hello-world-prod-source` GitHub connection handshake if the stack output still shows `PENDING`.
2. In GitHub repository variables, set `AWS_ACCOUNT_ID=498283327683` so Actions can assume the starter role created by the stack.

See [apps/portfolio/hello-world/hello-world-infra/README.md](/c:/Users/brand/code/personal/sandbox-monorepo/apps/portfolio/hello-world/hello-world-infra/README.md) for the app-specific CI/CD details.
