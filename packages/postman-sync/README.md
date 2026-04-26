# @repo/postman-sync

Local Postman generation and optional sync tooling for sandbox-monorepo apps.

The repo remains the source of truth. Postman collections and environments are generated from TypeScript config files and can be synced to Postman when a local API key is available.

## Commands

```bash
pnpm postman:generate --project signal-tracker
pnpm postman:validate --project signal-tracker
pnpm postman:sync --project signal-tracker
pnpm postman:run --project signal-tracker --env local
```

Use `--all` instead of `--project <slug>` to process every project with a `postman.config.ts`.

## API key

`postman:sync` requires `POSTMAN_API_KEY`. You can set it in the current shell:

```powershell
$env:POSTMAN_API_KEY = "your-postman-api-key"
```

Or create a repo-root `.env.local` file:

```text
POSTMAN_API_KEY=your-postman-api-key
```

`.env.local` is ignored by git. Do not paste Postman API keys into tracked repo files, generated artifacts, issue comments, or chat.

Generated collections, generated environments, and `.postman/postman-state.json` are intended to be committed. The state file contains remote Postman resource IDs only; it does not contain the API key.

## Project config

Each project can define `postman.config.ts` at the project root. The config owns collection metadata, environment values, known routes, and request config globs.

## Route config

Each route can define a colocated `*.postman-config.ts` file next to the route handler. Request configs should import route contracts from shared packages rather than duplicating method/path strings.

When adding a new API route:

1. Add or update the shared route contract.
2. Add the route handler and tests.
3. Add a colocated `*.postman-config.ts` with an example body when the route has a request schema.
4. Run `pnpm postman:generate --project <project-slug>`.
5. Run `pnpm postman:validate --project <project-slug>`.

## VS Code nesting

If useful, add this to local VS Code settings:

```json
{
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.ts": "${capture}.postman-config.ts, ${capture}.test.ts"
  }
}
```
