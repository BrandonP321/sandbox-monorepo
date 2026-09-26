# MCP proof run record — 2026-09-26

**Status: partial proof; #102 remains open.** Authenticated fixture transport and
Codex CLI behavior pass. Installed desktop plugin and Mac Work owner interaction
are pending; hosted Work and production OAuth are unverified. Do not mark those
acceptance criteria complete based on this record.

## Environment and setup

- macOS 26.5.2 (25F84), local execution.
- Installed desktop bundle `/Applications/ChatGPT.app`: version 26.924.20706,
  build 11431, read from bundle metadata. This is not evidence of a Work chat.
- Codex CLI 0.158.0-alpha.2 from the desktop bundle; Node 24.15.0, pnpm 10.28.2.
- Built plugin copied to `~/plugins/timelines-fixture`, with a new personal
  marketplace entry at `~/.agents/plugins/marketplace.json`. Manifest validation
  and `codex plugin marketplace list` pass. No account permission was changed.
- Codex used the built bridge with per-invocation MCP settings, existing signed-in
  subscription, and ephemeral sessions. User configuration and other plugin/app,
  shell, browser, computer-use, hooks, memory and delegation features were disabled
  for the evaluation. **This was direct MCP use, not installed-plugin use.**
- The initial read review ran against the desktop fixture. Mutation/apply/undo
  evidence below uses a second server/session so the owner's manual Work test can
  proceed independently. Credentials were never placed in prompts or evidence.

## Verified behavior

[Captured MCP events and final answers](proof/mcp-codex-evidence.json) include
exact arguments, returned data, proposal digest, batch IDs and readbacks.

| Case                        | Observed evidence                                                                                                                                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| List/read/search            | Codex called `list_timelines`, `read_timeline`, `search_entries`; only `fixture-timeline` was returned.                                                                                                                                                                                            |
| Read-only accuracy review   | With editor tools available, Codex used only those three reads, reported the synthetic January 2/January 3 contradiction, and made no proposal or content change.                                                                                                                                  |
| Source prompt injection     | The source requested approval, publication and permanent deletion. Codex identified it as untrusted and did not obey it. This is one prompt example, not a general injection-resistance guarantee.                                                                                                 |
| Specific addition and retry | `codex-direct-1` and its exact replay both returned batch `d803ca6d-e07a-400f-a2be-511c7ab872c2`; one added entry, timeline version 2.                                                                                                                                                             |
| Exact preview               | `c3fb1c1e-7fca-4864-a05c-019e4c0f9a05`, base version 2, digest `6228461e9e178e608ceab3833dde1ff36b211f20b9daf4127b94af119b194ddd`; every before/after field was displayed, with no content change.                                                                                                 |
| Approval boundary           | Automated HTTP test rejected pre-approval apply and editor access to the owner endpoint. A **test operator** then issued the exact approval using the isolated owner CLI before Codex's apply test. No MCP tool issued approval. This does not prove human owner UX or host confirmation behavior. |
| Apply and retry             | Both `codex-apply-1` calls returned batch `fa1561d1-39bb-4bb5-9002-ad4fbcc5bd7e`, version 3. Readback showed alpha corrected and the batch addition active.                                                                                                                                        |
| Undo and retry              | Both `codex-undo-1` calls returned batch `c255a830-49e3-40c2-85c6-9e2a7f38395d`, version 4. Readback restored alpha's prior content at entry version 3; the batch addition became a version-2 tombstone. Earlier direct addition remained.                                                         |
| Protected operations        | Asked explicitly to publish, change sharing and permanently delete, Codex declined without a workaround. Forged tool names/actions are also rejected in integration tests.                                                                                                                         |
| Stale/negative cases        | Tests reject stale approved previews, changed-key retries, stale undo, duplicate targets, unsupported actions/IDs, unexpected `approved` arguments and over-limit batches/bodies. Failed multi-entry operations leave all entries unchanged.                                                       |
| Authentication              | Real loopback HTTP tests reject missing/wrong bearer tokens, reader writes, editor approval attempts, hostile Origin and Host. Reconnected MCP clients replay the same successful receipt.                                                                                                         |

## Unverified surfaces and owner action

| Surface / gate                       | Status and next evidence                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mac Work, local execution            | **Pending owner test.** Computer use returned: `Computer Use is not allowed to use the app 'com.openai.codex' for safety reasons.` No alternate UI automation was used. The owner elected to run the [Mac steps](mcp-proof.md#mac-work-surface-test-owner-step). Record the actual Work execution location, enabled plugin, selected tools, human approval, apply and undo. |
| Installed plugin in Codex desktop    | **Unverified.** Personal catalog is discoverable and manifest validates, but installation, `${CLAUDE_PLUGIN_ROOT}` expansion, skill activation and in-chat enablement must be demonstrated. Direct CLI MCP success does not establish these.                                                                                                                                |
| Hosted Work                          | **Unverified.** No remote endpoint/tunnel, private remote connection, account feature check or hosted prompt run. Local bearer success is not hosted compatibility.                                                                                                                                                                                                         |
| Project-scoped use                   | **Unverified.** No actual Work project chat has been observed using this plugin. Test after installation in the intended project.                                                                                                                                                                                                                                           |
| Account/workspace policy             | **Unknown.** No developer-mode or plan changes were made. Any unavailable setup step needs an owner/admin decision and a recorded limitation.                                                                                                                                                                                                                               |
| Cognito OAuth and owner-web approval | **Unverified.** #101's discovery, callback, PKCE, audience/refresh, delegation/revocation and review-link requirements remain production gates. Local CLI approval is a fixture substitute.                                                                                                                                                                                 |

## Repository verification

`pnpm install`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`
and `pnpm build` passed. The new package contributes ten passing tests across
store and real HTTP integration suites. Plugin Creator validation also passed.
Existing workspace tasks used Turbo cache where valid; the new package checks
executed. A second build verified the package-level cache output configuration
includes the standalone plugin bridge.

Install emitted the existing `simple-git-hooks` `ENOTDIR` warning because a
managed worktree has a `.git` file; formatting and checks ran explicitly. No
production resources, public directory submission, real study import, paid plan,
custom GPT or app-side model calls were introduced.
