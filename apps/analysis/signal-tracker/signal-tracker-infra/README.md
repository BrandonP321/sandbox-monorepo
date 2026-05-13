# Signal Tracker Infra

AWS CDK stack for the Signal Tracker API, Aurora PostgreSQL database foundation,
and static web site.

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

Deploy provisions the API and static hosting first, reads the deployed API URL,
then builds and publishes the frontend with `VITE_API_BASE_URL`:

```bash
pnpm --filter signal-tracker-infra deploy
```

For Codex or any other non-interactive terminal, pass the CDK approval override so IAM prompts do not block the deploy:

```bash
pnpm --filter signal-tracker-infra run deploy:ci
```

The CDK stack does not write `/config.json`. The API URL is embedded into the
Vite bundle at build time and the built assets are synced to the stack's web
bucket after `cdk deploy`.

### Database capacity modes

The Aurora PostgreSQL Serverless v2 cluster defaults to the low-idle-cost mode:

- min capacity: `0 ACU`
- max capacity: `2 ACU`
- auto-pause: `10 minutes`
- RDS Data API: enabled
- RDS Proxy: deferred

For recruiting or portfolio-review windows, deploy with min `0.5 ACU` so first
reviewer requests avoid database wake-up latency:

```bash
pnpm --filter signal-tracker-infra run deploy:ci -- -c dbCapacityMode=recruiting
```

Return to the default/dormant scale-to-zero mode by omitting the context value or
passing `-c dbCapacityMode=default`.

The database lives in an isolated VPC with no NAT Gateway. Application and
migration access uses Aurora Data API, not direct TCP connectivity from a laptop
or deploy runner.

## Outputs

- `ApiBaseUrl`: HTTP API endpoint
- `WebUrl`: CloudFront distribution URL for the frontend
- `WebBucketName`: private S3 bucket that stores the built frontend assets
- `WebDistributionId`: CloudFront distribution invalidated after asset publish
- `SignalTrackerDatabaseName`: default database name for API and migration config
- `SignalTrackerDatabaseResourceArn`: Aurora cluster ARN for Data API calls
- `SignalTrackerDatabaseSecretArn`: Secrets Manager credential ARN for Data API calls
- `SignalTrackerDatabaseCapacityMode`: `default` or `recruiting`
- `SignalTrackerDeployPipelineName`: CodePipeline used for Prod deploys
- `SignalTrackerDeployProjectName`: CodeBuild project used by the `Prod` stage for validation, deployment, and URL output variables
- `SignalTrackerGitHubActionsRoleArn`: IAM role GitHub Actions assumes to start the deploy pipeline
- `SignalTrackerGitHubConnectionArn`: AWS CodeConnections ARN for the GitHub source
- `SignalTrackerGitHubConnectionStatus`: Connection status, usually `PENDING` until the one-time console handshake is finished

## CI/CD

`signal-tracker` uses the repo's hybrid pipeline pattern:

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
- a `Validate` stage with one CodeBuild action that runs lint, typecheck, tests, and builds
- a `Prod` stage with one CodeBuild action that builds deployable assets, deploys, and exports deployment URLs

After `Prod/Deploy` succeeds, open the action execution details in CodePipeline and view the `ProdUrls` output variables:

- `WEB_URL`: deployed frontend URL
- `API_BASE_URL`: deployed API base URL

The same values are printed in the `signal-tracker-prod-deploy` CodeBuild logs.

GitHub Actions starts the pipeline manually with the exact Git commit SHA, so the pipeline does not auto-run on repo pushes.

The validate buildspec executes:

```bash
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run lint
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run typecheck
pnpm -r --filter signal-tracker-web... --filter signal-tracker-api... --filter signal-tracker-infra... run test
pnpm --filter signal-tracker-web run build
pnpm -r --workspace-concurrency=1 --filter signal-tracker-api... --filter signal-tracker-infra... run build
```

The deploy buildspec executes:

```bash
pnpm -r --filter signal-tracker-api... --filter signal-tracker-infra... run build
pnpm --filter signal-tracker-infra run deploy:ci:no-build
pnpm --filter signal-tracker-infra run publish:web
```

`publish:web` reads `ApiBaseUrl`, `WebBucketName`, and `WebDistributionId`,
builds `signal-tracker-web` with `VITE_API_BASE_URL`, syncs `dist/` to S3, and
invalidates CloudFront.

Database migrations are not executed by the pipeline yet. Run the explicit
`signal-tracker-api` Data API migration command after deployment when a PR adds
new migration files.

The buildspecs live at:

- `apps/analysis/signal-tracker/signal-tracker-infra/buildspec.validate.yml`
- `apps/analysis/signal-tracker/signal-tracker-infra/buildspec.prod.yml`

Signal Tracker CodeBuild projects use the AWS-managed Node `24` Lambda compute image.

The buildspecs pin:

- Node `24` through the CodeBuild Lambda image
- the repo-pinned pnpm version from the root `package.json`
