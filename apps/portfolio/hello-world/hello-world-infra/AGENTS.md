# AGENTS.md - hello-world-infra

## Commands

- Synth: `pnpm --filter hello-world-infra synth`
- Diff: `pnpm --filter hello-world-infra diff`
- Deploy: `pnpm --filter hello-world-infra deploy`
- Non-interactive deploy: `pnpm --filter hello-world-infra run deploy:ci`
- Destroy: `pnpm --filter hello-world-infra destroy`
- Tests: `pnpm --filter hello-world-infra test`
- Lint: `pnpm --filter hello-world-infra lint`
- Typecheck: `pnpm --filter hello-world-infra typecheck`
- Build: `pnpm --filter hello-world-infra build`

## Notes

- Deploy CDK before publishing frontend assets so the API URL is available, then build the web bundle with `VITE_API_BASE_URL` and sync `dist/` to the stack's web bucket.
- Standard AWS CLI profile: `sandbox-admin`
- Standard region: `us-east-1`
- Current deployment account: `498283327683`
- Prefer AWS IAM Identity Center / SSO on laptops. Verify with `aws sts get-caller-identity --profile sandbox-admin` before deploy/debug work.
- Non-interactive Codex runs should pass `--require-approval never` because this stack creates IAM resources and CDK otherwise waits for terminal approval.
