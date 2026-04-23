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
