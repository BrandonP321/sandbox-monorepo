# CLAUDE.md

Follow the same repository conventions as `AGENTS.md`:
- Keep project layout as `apps/<domain>/<project>/<project>-{web,api,infra}`.
- Consolidate reusable logic into `packages/*`.
- Use `@repo/api-core`, `@repo/api-contracts`, and `@repo/infra-patterns` as platform defaults.
- Keep APIs on POST routes by default, with route path names matching route filenames.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before finishing.
