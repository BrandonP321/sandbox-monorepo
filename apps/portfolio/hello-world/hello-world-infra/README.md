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
- `HelloWorldDeployProjectName`: CodeBuild project used by the `Prod` stage for validation, deployment, and URL output variables
- `HelloWorldGitHubActionsRoleArn`: IAM role GitHub Actions assumes to start the deploy pipeline
- `HelloWorldGitHubConnectionArn`: AWS CodeConnections ARN for the GitHub source
- `HelloWorldGitHubConnectionStatus`: Connection status, usually `PENDING` until the one-time console handshake is finished

## CI/CD

`hello-world` uses a hybrid pipeline:
- GitHub Actions handles monorepo-aware change detection and starts the AWS pipeline for qualifying pushes to `main`.
- AWS CodePipeline owns the detailed validation and Prod deployment flow.

### GitHub workflow behavior

- Workflow file: `.github/workflows/hello-world.yml`
- Reusable workflow: `.github/workflows/project-cicd.yml`
- Repo-local change detector: `scripts/project-changed.mjs`

The workflow runs only when:
- a file under `apps/portfolio/hello-world/` changes, or
- any file outside `apps/` changes

That means changes limited to another app under `apps/` do not trigger the `hello-world` pipeline.

For pushes to `main`, GitHub Actions:
- checks whether the change should affect `hello-world`
- starts the `hello-world-prod` pipeline with the exact Git commit SHA
- exits immediately after the pipeline execution has been created

That keeps the GitHub workflow fast and moves the real execution details into CodePipeline and CodeBuild.

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

GitHub Actions then assumes the stack-created role named `hello-world-prod-starter` and uses it only to start the `hello-world-prod` pipeline.

### Pipeline flow

The `hello-world-prod` pipeline has:
- a `Source` stage that reads this repo through CodeConnections
- a `Validate` stage with one CodeBuild action that runs lint, typecheck, tests, and builds
- a `Prod` stage with one CodeBuild action that builds deployable assets, deploys, and exports deployment URLs

After `Prod/Deploy` succeeds, open the action execution details in CodePipeline and view the `ProdUrls` output variables:

- `WEB_URL`: deployed frontend URL
- `API_BASE_URL`: deployed API base URL

The same values are printed in the `hello-world-prod-deploy` CodeBuild logs.

GitHub Actions starts the pipeline manually with the exact Git commit SHA, so the pipeline does not auto-run on repo pushes.

The validate buildspec executes:

```bash
pnpm -r --filter hello-world-web... --filter hello-world-api... --filter hello-world-infra... run lint
pnpm -r --filter hello-world-web... --filter hello-world-api... --filter hello-world-infra... run typecheck
pnpm -r --filter hello-world-web... --filter hello-world-api... --filter hello-world-infra... run test
pnpm -r --filter hello-world-web... --filter hello-world-api... --filter hello-world-infra... run build
```

The deploy buildspec executes:

```bash
pnpm -r --filter hello-world-web... --filter hello-world-api... --filter hello-world-infra... run build
pnpm --filter hello-world-infra run deploy:ci:no-build
```

The buildspecs live at:

- `apps/portfolio/hello-world/hello-world-infra/buildspec.validate.yml`
- `apps/portfolio/hello-world/hello-world-infra/buildspec.prod.yml`

The CodeBuild projects use the Lambda-backed Node 24 image for faster startup.

The buildspec installs the repo-pinned pnpm version from the root `package.json`; the validate build also installs Chromium for the `@repo/ui` Storybook browser tests pulled in by the `hello-world-web...` filter.
