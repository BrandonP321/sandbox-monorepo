# AGENTS.md - signal-tracker-infra

Also follow `../AGENTS.md` for Signal Tracker product scope, Google Drive source-of-truth docs, and R1 MVP boundaries.

## Commands
- Synth: `pnpm --filter signal-tracker-infra synth`
- Diff: `pnpm --filter signal-tracker-infra diff`
- Deploy: `pnpm --filter signal-tracker-infra deploy`
- Non-interactive deploy: `pnpm --filter signal-tracker-infra run deploy:ci`
- Destroy: `pnpm --filter signal-tracker-infra destroy`
- Tests: `pnpm --filter signal-tracker-infra test`
- Lint: `pnpm --filter signal-tracker-infra lint`
- Typecheck: `pnpm --filter signal-tracker-infra typecheck`
- Build: `pnpm --filter signal-tracker-infra build`

## Notes
- Build the frontend before `cdk deploy` so the `dist/` assets are available.
- Standard AWS CLI profile: `sandbox-admin`
- Standard region: `us-east-1`
- Current deployment account: `498283327683`
- Prefer AWS IAM Identity Center / SSO on laptops. Verify with `aws sts get-caller-identity --profile sandbox-admin` before deploy/debug work.
- Non-interactive Codex runs should pass `--require-approval never` because this stack creates IAM resources and CDK otherwise waits for terminal approval.
