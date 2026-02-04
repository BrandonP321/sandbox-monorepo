# AGENTS.md - hello-world-infra

## Commands
- Synth: `pnpm --filter hello-world-infra synth`
- Diff: `pnpm --filter hello-world-infra diff`
- Deploy: `pnpm --filter hello-world-infra deploy`
- Destroy: `pnpm --filter hello-world-infra destroy`
- Tests: `pnpm --filter hello-world-infra test`
- Lint: `pnpm --filter hello-world-infra lint`
- Typecheck: `pnpm --filter hello-world-infra typecheck`
- Build: `pnpm --filter hello-world-infra build`

## Notes
- Build the frontend before `cdk deploy` so the `dist/` assets are available.
