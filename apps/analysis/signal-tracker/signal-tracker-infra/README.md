# Signal Tracker Infra

AWS CDK stack for the Signal Tracker API and static web site.

## Prerequisites

- Node `24` from the repo root `.nvmrc`
- pnpm installed
- AWS CLI v2 configured with IAM Identity Center / SSO
- Standard AWS profile: `sandbox-admin`
- Standard AWS region: `us-east-1`
- Current AWS account: `498283327683`

On a fresh laptop, configure AWS CLI SSO first:

```bash
aws configure sso
aws sso login --profile sandbox-admin
aws sts get-caller-identity --profile sandbox-admin
```

Set the expected environment for the terminal session:

```bash
export AWS_PROFILE=sandbox-admin
export AWS_REGION=us-east-1
export AWS_DEFAULT_REGION=us-east-1
```

On PowerShell:

```powershell
$env:AWS_PROFILE="sandbox-admin"
$env:AWS_REGION="us-east-1"
$env:AWS_DEFAULT_REGION="us-east-1"
```

CDK bootstrap is one-time per account/region:

```bash
pnpm --filter signal-tracker-infra exec cdk bootstrap aws://498283327683/us-east-1
```

## Deploy

Deploy builds the frontend and deploys API + web in one command:

```bash
pnpm --filter signal-tracker-infra deploy
```

For Codex or any other non-interactive terminal, pass the CDK approval override so IAM prompts do not block the deploy:

```bash
pnpm --filter signal-tracker-infra run deploy:ci
```

The stack also writes `/config.json` into the site bucket so the frontend picks
up the deployed API URL at runtime.

If `dist/` is missing, the CDK stack will skip static assets and emit a warning.

## Outputs

- `ApiBaseUrl`: HTTP API endpoint
- `WebUrl`: CloudFront distribution URL for the frontend
- `SignalTrackerDeployPipelineName`: CodePipeline used for Prod deploys
- `SignalTrackerDeployProjectName`: CodeBuild project used by the `Prod` stage
- `SignalTrackerGitHubActionsRoleArn`: IAM role GitHub Actions assumes to start the deploy pipeline
- `SignalTrackerGitHubConnectionArn`: AWS CodeConnections ARN for the GitHub source
- `SignalTrackerGitHubConnectionStatus`: Connection status, usually `PENDING` until the one-time console handshake is finished

## CI/CD

`signal-tracker` uses the same hybrid pipeline pattern as `hello-world`:

- GitHub Actions handles monorepo-aware change detection and starts the AWS pipeline for qualifying pushes to `main`.
- AWS CodePipeline owns the detailed validation and Prod deployment flow.

### GitHub workflow behavior

- Workflow file: `.github/workflows/signal-tracker.yml`
- Reusable workflow: `.github/workflows/project-cicd.yml`
- Repo-local change detector: `scripts/project-changed.mjs`

The workflow runs only when:

- a file under `apps/analysis/signal-tracker/` changes, or
- any file outside `apps/` changes

That means changes limited to another app under `apps/` do not trigger the `signal-tracker` pipeline.

For pushes to `main`, GitHub Actions:

- checks whether the change should affect `signal-tracker`
- starts the `signal-tracker-prod` pipeline with the exact Git commit SHA
- exits immediately after the pipeline execution has been created

### One-time setup after stack deploy

1. Deploy the stack:

```bash
pnpm --filter signal-tracker-infra run deploy:ci
```

2. Open AWS CodeConnections in `us-east-1` and finish the `signal-tracker-prod-source` GitHub connection setup if the stack output is still `PENDING`.

3. In GitHub repository variables, set:

```text
AWS_ACCOUNT_ID=498283327683
```

GitHub Actions then assumes the stack-created role named `signal-tracker-prod-starter` and uses it only to start the `signal-tracker-prod` pipeline.

### Pipeline flow

The `signal-tracker-prod` pipeline has:

- a `Source` stage that reads this repo through CodeConnections
- a `Validate` stage with a CodeBuild validation action
- a `Prod` stage with a CodeBuild deploy action

GitHub Actions starts the pipeline manually with the exact Git commit SHA, so the pipeline does not auto-run on repo pushes.

The validate stage executes:

```bash
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run lint
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run typecheck
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run test
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run build
pnpm --filter signal-tracker-infra run synth
```

The deploy stage executes:

```bash
pnpm --filter signal-tracker-infra run deploy:ci
```

The buildspecs live at:

- `apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml`
- `apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml`

Both CodeBuild projects currently use the standard EC2-backed image because the repo baseline is Node `24`, while AWS-managed Lambda compute images currently top out at Node `22`.

The buildspecs pin:

- Node `24`
- the repo-pinned pnpm version from the root `package.json`
