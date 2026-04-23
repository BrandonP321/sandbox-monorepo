# Hello World Infra

AWS CDK stack for the Hello World API and static web site.

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
pnpm --filter hello-world-infra exec cdk bootstrap aws://498283327683/us-east-1
```

## Deploy

Deploy builds the frontend and deploys API + web in one command:

```bash
pnpm --filter hello-world-infra deploy
```

For Codex or any other non-interactive terminal, pass the CDK approval override so IAM prompts do not block the deploy:

```bash
pnpm --filter hello-world-infra run deploy:ci
```

The stack also writes `/config.json` into the site bucket so the frontend picks
up the deployed API URL at runtime.

If `dist/` is missing, the CDK stack will skip static assets and emit a warning.

## Outputs

- `ApiBaseUrl`: HTTP API endpoint
- `WebUrl`: CloudFront distribution URL for the frontend
- `HelloWorldDeployPipelineName`: CodePipeline used for Prod deploys
- `HelloWorldDeployProjectName`: CodeBuild project that performs the deploy stage inside the pipeline
- `HelloWorldGitHubActionsRoleArn`: IAM role GitHub Actions assumes to start and poll the deploy pipeline
- `HelloWorldGitHubConnectionArn`: AWS CodeConnections ARN for the GitHub source
- `HelloWorldGitHubConnectionStatus`: Connection status, usually `PENDING` until the one-time console handshake is finished

## CI/CD

`hello-world` uses a hybrid pipeline:
- GitHub Actions handles change detection and CI for pull requests and pushes to `main`.
- AWS CodePipeline runs the Prod deployment flow.

### GitHub workflow behavior

- Workflow file: `.github/workflows/hello-world.yml`
- Reusable workflow: `.github/workflows/project-cicd.yml`
- Repo-local change detector: `scripts/project-changed.mjs`

The workflow runs only when:
- a file under `apps/portfolio/hello-world/` changes, or
- any file outside `apps/` changes

That means changes limited to another app under `apps/` do not trigger the `hello-world` pipeline.

### One-time setup after stack deploy

1. Deploy the stack:

```bash
pnpm --filter hello-world-infra run deploy:ci
```

2. Open AWS CodeConnections in `us-east-1` and finish the `hello-world-prod-source` GitHub connection setup if the stack output is still `PENDING`.

3. In GitHub repository variables, set:

```text
AWS_ACCOUNT_ID=498283327683
```

GitHub Actions then assumes the stack-created role named `hello-world-prod-starter` and uses it only to start and poll the `hello-world-prod` pipeline.

### Prod deploy flow

The `hello-world-prod` pipeline has:
- a `Source` stage that reads this repo through CodeConnections
- a `Prod` stage with a CodeBuild deploy action

GitHub Actions starts the pipeline manually with the exact validated commit SHA, so the pipeline does not auto-run on repo pushes and still deploys the same revision that passed CI.

The deploy stage executes:

```bash
pnpm --filter hello-world-infra run deploy:ci
```

The buildspec lives at `apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml`. The deploy project currently uses the standard EC2-backed CodeBuild image because the repo baseline is Node `24`, while AWS-managed Lambda compute images currently top out at Node `22`.

The buildspec pins:
- Node `24`
- the repo-pinned pnpm version from the root `package.json`
