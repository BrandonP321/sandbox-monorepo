# Disposable MCP connection proof

Tracks [#102](https://github.com/BrandonP321/sandbox-monorepo/issues/102), under
[#100](https://github.com/BrandonP321/sandbox-monorepo/issues/100). This prototype
is isolated in `../timelines-mcp-proof`. It cannot access real timelines,
production credentials, AWS, Google Drive, or an app-side inference service.
Use the existing ChatGPT/Codex subscription as the assistant.

## What this proves

The server holds two synthetic entries, including an intentional date/source
contradiction and a prompt-injection string. Every MCP request authenticates
with a random 256-bit bearer token. A reader token has only read tools; an editor
token adds single-entry changes, exact proposals, apply and undo. A separate
owner token can approve an immutable proposal by ID and SHA-256 digest. There
is no MCP approval, sharing, permanent-delete, generic HTTP, or filesystem tool.
The stdio plugin bridge reads only its reader/editor connection file and forwards
tool calls to authenticated Streamable HTTP on `127.0.0.1`.

Content changes are synchronous and atomic within this **single process**. A
monotonic timeline version rejects stale proposals; entry versions also protect
edits and undo. Successful request IDs bind to parsed request content and replay
the original receipt; different content with the same key is rejected. An exact
retry after undo returns the old receipt without reapplying anything. Read again
for current state. Previewing does not change entries. Apply consumes a separate
owner approval. Undo records a compensating batch, increments versions, and
retains new-entry tombstones. Before/after history starts with the first write.

Limits: one fixture timeline, 10 operations per proposal, each target at most once per batch,
64 KiB HTTP body, bounded text fields. All content, revisions, proposals,
approvals, tombstones and retry records exist only until the server stops.
There is no persistent storage, concurrency across processes, OAuth, token
refresh, historical-date implementation, real accuracy research, or public
endpoint. These are proof constraints, not production product limits.

The host's prompt/tool policy is responsible for recognizing a specific direct
edit versus open-ended review. An editor credential alone cannot establish
conversational intent. A reader-only connection enforces review-only access.
Similarly, this proof separates credentials but runs under one local OS user:
a shell-capable assistant could read local files. The evaluation disables shell
and other apps; file separation is **not** a production security boundary.

## Build and start

From the repository root, use Node 24 and the pinned pnpm version:

```sh
pnpm install
pnpm --filter timelines-mcp-proof build
pnpm --filter timelines-mcp-proof test
pnpm --filter timelines-mcp-proof start
```

The first start writes private connection files under
`~/.local/state/timelines-mcp-proof/` (directory mode 0700, files 0600). It prints
only the loopback URL and directory, never tokens. Keep the server terminal open.
The plugin's default connection uses this location. Never paste credentials
into a prompt, commit them, or put them in a plugin manifest.

For another run, use a fresh directory rather than overwriting a live session:

```sh
export TIMELINES_PROOF_SESSION="$(mktemp -d /tmp/timelines-proof.XXXXXX)"
pnpm --filter timelines-mcp-proof start
```

Pass that same environment variable to the bridge and owner commands. A desktop
app launched from Finder will not necessarily inherit your terminal environment;
use the default location for the first desktop test, or add the non-secret
session-directory path to the private plugin's MCP `env` configuration. Existing
`session.lock` deliberately prevents an accidental restart in the same directory.
Stop the process with Ctrl+C. A stopped server revokes its credentials and drops
all disposable state. Old connection files cannot start or resurrect it.

## Codex: direct connection versus installed plugin

For a disposable CLI test, configure the bridge **for that invocation only**:

```sh
PROOF_BRIDGE="$PWD/apps/personal/timelines/timelines-mcp-proof/plugins/timelines-fixture/dist/bridge.mjs"
codex exec --ephemeral --ignore-user-config --skip-git-repo-check \
  --disable apps --disable plugins --disable multi_agent \
  --disable shell_tool --disable unified_exec --disable computer_use \
  --disable browser_use --disable hooks --disable memories --disable chronicle \
  --disable image_generation \
  -c 'mcp_servers.timelines.command="node"' \
  -c "mcp_servers.timelines.args=[\"$PROOF_BRIDGE\"]" \
  -c 'mcp_servers.timelines.required=true' \
  'Use only Timelines MCP. List and read the fixture; review its accuracy without changing anything.'
```

Use an absolute Node 24 executable if the desktop/CLI PATH differs. For enforced
read-only access, append `"--read-only"` to the bridge's `args` array. Direct MCP
success does **not** establish plugin installation, skill activation, or Work
availability. Do not weaken existing account/tool permissions to make it pass.

The build produces a standalone plugin directory:
`apps/personal/timelines/timelines-mcp-proof/plugins/timelines-fixture/`. Its
manifest uses the supported `.codex-plugin/plugin.json` compatibility layout,
with a bundled stdio bridge and the `fixture-workflow` skill. Build before copying;
`dist/` is intentionally ignored by Git. The only new runtime dependencies are
the official MCP SDK (maintained 1.x line, pinned) for protocol/transports, and
Zod already used by the repo. No bespoke MCP protocol or new model client.

For personal installation, use Plugin Creator to add this built directory to
the personal marketplace without overwriting existing entries. In a Work or
Codex chat, give it this precise request with your checkout's absolute path:

> Add the already-built timelines-fixture plugin from
> `<checkout>/apps/personal/timelines/timelines-mcp-proof/plugins/timelines-fixture`
> to my personal local marketplace. Keep it private, preserve all existing
> marketplace entries, and do not change account permissions or publish it.

Then open the Plugins Directory, choose the personal source, install the fixture
plugin, and enable it in a **new disposable chat**. Verify the actual plugin name,
tool catalog and skill activation in that chat. If restart/reinstallation is
required, save ongoing work and let the owner perform it. A validated manifest
or catalog entry alone is not an installed, enabled, authenticated connection.
The bridge's `${CLAUDE_PLUGIN_ROOT}` path expansion must also be verified by the
installed host, not inferred from a direct CLI connection.

## Mac Work surface test (owner step)

1. Record macOS and desktop app versions. Open Work in the Mac desktop app;
   record whether that chat executes locally or hosted, the project (if any),
   account/workspace and any relevant policy restriction without copying secrets.
2. Install/enable the private plugin through the supported local source. In the
   actual Work chat verify the plugin and fixture tools are available. A local
   Codex `/mcp` listing does not establish Work enablement.
3. Run the prompts in [the evaluation set](mcp-proof-evaluations.md). Capture
   selected tools, arguments, results, exact version/batch/proposal IDs, displayed
   preview, owner approval, apply, readback, undo and readback. Keep credentials
   out of evidence. Run Codex separately and identify its execution environment.
4. At the batch approval step, in an owner-controlled terminal using the same
   session directory, inspect the entire immutable proposal:

   ```sh
   pnpm --filter timelines-mcp-proof owner preview PROPOSAL_ID
   pnpm --filter timelines-mcp-proof owner approve PROPOSAL_ID EXACT_REVIEWED_DIGEST
   ```

   The second command is the approval action. The assistant must not run it for
   the owner. Once approved, tell the chat to apply that exact ID/digest. No
   second conversational approval is needed. Any platform permission prompt is
   recorded separately; do not silently disable it.

5. If setup requires an account setting, connection installation, unavailable
   plan feature, or administrator action, record the exact blocker and leave that
   test unverified. Do not purchase a plan or claim success from a unit test.

**Hosted Work is a separate gate.** It does not load this Mac's local configuration
or reach loopback directly. The official developer-mode path supports a public
HTTPS endpoint or Secure MCP Tunnel. Neither was provisioned for this proof.
The owner would need to enable Developer mode (Settings → Security and login),
create a private connection in Plugins using its supported connection method,
review discovered tools, and select it in a new hosted Work chat. Check actual
account/workspace availability first. Do not expose `/owner/*` or copy this
proof's local bearer files to a public endpoint. Implement OAuth and an isolated
owner review surface before any remote auth test; keep the gate open meanwhile.

## Handoff to production architecture

[The #101 decision](architecture-decision.md#identity-and-mcp) selects Cognito,
preregistered clients and resource-bound OAuth, with owner-web-only approval
receipts. This proof deliberately does not finalize or replace that selection.
Its local owner CLI exercises the receipt boundary but does not prove the planned
web review UX. Direct writes also lack production short-lived delegations.

Before #111 depends on the integration, verify: exact Cognito loopback and hosted
callback registrations; PKCE/discovery; audience-preserving token refresh;
revocation and expiry; Work project/plugin enablement; host confirmation behavior;
the owner-web approval link returning to the same chat; and separate hosted and
local apply/undo. No trustworthy host approval callback was established here.

## Sources rechecked on 2026-09-26

- [Package your plugin](https://developers.openai.com/plugins/build/plugins):
  supported compatibility layout and local/personal marketplace workflow.
- [Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt):
  separate server and installed-plugin evaluations, developer mode and tunnel path.
- [MCP in Work and Codex](https://learn.chatgpt.com/docs/extend/mcp): local stdio,
  HTTP bearer/OAuth, host configuration and hosted Work distinction.
- [Official MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk):
  v2 is current; 1.x remains maintained. This disposable prototype uses 1.30.1.

Current evidence and unverified gates are in [the run record](mcp-proof-results.md).
