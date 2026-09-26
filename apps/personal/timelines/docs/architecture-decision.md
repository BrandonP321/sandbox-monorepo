# TDR 001 — Timelines persistence, access, recovery and cost

Date: 2026-09-25 (America/Los_Angeles). Status: selected architecture; synthetic
proof complete, deployed performance and desktop authentication still to verify.
Task: [#101](https://github.com/BrandonP321/sandbox-monorepo/issues/101).
Approved product scope and implementation sequence remain in
[#100](https://github.com/BrandonP321/sandbox-monorepo/issues/100).
This is a technical decision, not another product tracker.

## Decision and evidence

Use S3/CloudFront for static assets, one HTTP API/Lambda service for owner,
public-view and stateless MCP adapters, Cognito for owner identity, and a DynamoDB
Standard on-demand table per environment. No VPC, NAT, provisioned concurrency,
search cluster, database server, or app-side model calls. Start with primary-table
materialized lookup rows and **no GSI/LSI**. Publish bounded, version-checked
transactions; imports exceeding a transaction are explicitly separate batches.

The [cost model](costs.md) estimates **$4.68/month for production plus an isolated
test environment**, excluding all free allowances, at the declared personal-use
baseline. Elevated sharing is $29.67/month; this is not a billing ceiling.

Full per-source metadata reads solve interval overlap correctly at the target
scale. This deliberately trades cold-read work for simple indexing and reliable
recovery. PostgreSQL would simplify range search, foreign keys and recursive
queries, but continuously active Aurora exceeds the budget before other costs.
The cost comparison includes its useful, but slower, scale-to-zero mode.

Inspected reuse points:

| Existing code                                                                                                 | Reuse / adaptation                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api-core/src/index.ts`                                                                              | Router, errors and structured logging. Add project authentication middleware; its CORS headers and router are **not authentication**. Override wildcard response CORS and redact error messages containing content.                         |
| `packages/infra-patterns/src/index.ts`                                                                        | `SpaSite`, `HttpLambdaApi`, shared domain imports; configure route throttles. Static bucket destruction defaults must never be used for content/backup storage.                                                                             |
| `packages/infra-patterns/src/github-actions-codepipeline-deploy.ts`                                           | Existing V2 pipeline/OIDC pattern, with explicit EC2 small build runner in this cost model. Its broad deploy role needs project scoping in #113.                                                                                            |
| `apps/analysis/signal-tracker/signal-tracker-infra/lib/signal-tracker-database.ts` and API `src/db/client.ts` | Aurora Data API, isolated subnets/no NAT, 0–2 ACU with ten-minute pause versus 0.5 ACU floor. Evaluated, not adopted.                                                                                                                       |
| `apps/personal/wedding-website/wedding-website-api/src/rsvp/dynamodb-rsvp-repository.ts` and infra stack      | Conditional transactional writes, strongly consistent retry reconciliation, request-hash conflict, redacted diagnostics, PITR, deletion protection and RETAIN. Do not reuse its shared admin key, scan-based admin model or RSVP contracts. |

No shared historical-date or interval implementation was found in `packages/*`.
The isolated proof below adds no dependencies or production package scaffold.
Domain contracts go into `timelines-shared` in #104, adapters into `timelines-api`.
The web app owns a new visual system; behavior-only helpers are reusable, styled
dashboard/Brainpane components and styles are excluded.

## Entity contracts

All persisted content uses `schemaVersion: 1`, server-generated UUIDv4 `id`,
immutable `ownerId`, integer `version >= 1`, UTC `createdAt`/`updatedAt`, nullable
`deletedAt`, and server-derived actor attribution. Creation expects version 0
(absence); updates, soft deletion and restore increment the same stable ID's
version. IDs are never recycled. UUID is an identity, not a chronological date.

`Actor = { principalId, clientId, surface: web | mcp | import | system,
requestId }`. `principalId` comes from verified issuer + subject mapping, never
email or a caller-supplied owner field. Import provenance is a separate untrusted
field, not an authenticated actor. Single owner initially; all keys and services
are owner-scoped so IDs alone never authorize reads.

| Entity      | Required contract and invariants                                                                                                                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner       | Internal ID, exact allowed issuer/sub, `enabled`, `contentEpoch`, `securityEpoch`, `tokensValidAfter`, `publicEnabled`. Epochs are monotonically increasing integers. Content epoch serializes all content mutations; security epoch serializes access changes.                     |
| Timeline    | Title, description. Independently addressable source container; deleting it does not delete entries or included timelines. A deleted container and its entries disappear from live views; recovery preserves IDs. Creating/moving entries into a deleted source is invalid.         |
| Entry       | Exactly one canonical `sourceTimelineId`, one active `typeId`, title, description, `historicalDate`, references and image URL metadata. Inclusion never copies entries. A move preserves entry ID/history and updates both source lookup partitions in one transaction.             |
| Type        | Owner-wide name, text label, validated `#RRGGBB` color. Renaming changes every live view through ID lookup, without rewriting entries. Referenced types cannot be deleted; reassignment is an explicit batch operation. No merge by name.                                           |
| Inclusion   | Stable ID, `parentTimelineId`, `sourceTimelineId`; active pair unique, no self-link or directed cycle. Both endpoints belong to the owner. Removal tombstones only the link. Restoring it revalidates the entire active graph.                                                      |
| Revision    | Immutable `(entityKind, entityId, version)`, full after-image including tombstone, previous revision ID (null for first write), batch ID, actor, timestamp. Before-image resolves through the preceding revision; history is never edited or expired.                               |
| ChangeBatch | Stable ID, name, exact operation digest, ordered target IDs and before/after revision IDs, actor, committed timestamp, optional `undoOf`, proposal/import IDs and chunk number. Written only on successful commit. Failed attempts cannot masquerade as committed batches.          |
| Proposal    | Immutable operation list and resolved before/after values, expected entity versions, baseline content epoch, affected source/global impact, digest, creator, expiration and approval state. An edit makes a new proposal ID/digest. Creating a proposal changes no current content. |
| ShareGrant  | Separate security entity: random ID, root timeline ID, **explicit set of allowed source timeline IDs including root**, token SHA-256, active/revoked state, version and optional expiry. Changes require owner-web privilege. No grant restoration through content undo/import.     |
| Idempotency | `(ownerId, principalId, operationKind, clientKey)` maps to canonical request hash, batch/result ID and timestamp. Same key/hash returns original result; different hash is 409. Authorize before replay. Keys are 16–128 ASCII characters; server hashes the composite key.         |

Validation is server-side and identical for web/MCP/import: title/name 1–200
Unicode code points, description at most 8,000, 20 references per entry, 5 image
URLs, URL at most 2,048 characters, reference/caption at most 1,000 and alt text
at most 500. Combined serialized current entity must be <=16 KiB including
attribute names; revision envelope <=20 KiB. Reject over-limit input with field
errors, never truncate. Metadata row <=2 KiB. References are `{id, kind:
url | text, value, label?}`; images are `{id, url, caption?, alt}`. Only HTTPS
external URLs with no embedded credentials; reject unsafe schemes and private/
loopback literal hosts. Render plain text or sanitized markdown, never raw HTML.
Do not server-fetch arbitrary URLs or linked document contents. External image
loads use `no-referrer`; empty alt is allowed only for explicitly decorative images.

## Historical-date access and ordering

#104 owns actual date schemas/calendar arithmetic. Its storage interface must
produce `{kind, lowerDay: integer | null, upperDay: integer | null,
sortAnchorDay: integer, originalText?, precision, approximate}` without converting
historical dates to JavaScript timestamps. Proleptic Gregorian civil dates,
1,000,000 BCE–9999 CE, no displayed year zero; internal astronomical numbering
is allowed for arithmetic. Preserve original calendar wording; do not imply
automatic Julian conversion. Validate precision, leap days and reversed ranges.

Closed, discrete-day envelopes drive candidate inclusion:
`(lowerDay == null || lowerDay <= viewportEnd) &&
(upperDay == null || upperDay >= viewportStart)`.
Year/month precision spans the entire supplied year/month. A period means duration;
an uncertain interval means one occurrence somewhere in the interval. Store those
different kinds even if their envelope is identical. Approximation without an
explicit uncertainty range adds a visual qualifier, not invented +/- years.
Strict `before X` ends on the day before the earliest possible X; strict `after X`
starts after its latest possible day. Open bounds use null, never huge fake dates
or infinite renderer coordinates. A bounded envelope must contain at least one
supported day. Unknown/undated entries are not in this release; reject rather than
assigning a fabricated date.

Order ascending by finite `sortAnchorDay`, then UUID bytes. Anchor is the earliest
finite bound for period/uncertainty, the boundary day for a one-sided date, and
the earliest day for a partial occurrence. Labels preserve precision and kind;
anchor is a sorting convention, not an assertion of exact occurrence. Fit-to-content
uses finite anchors/bounds; before/after arrows are clipped at viewport edges.

### Primary keys and access patterns

Notation: `O` owner, `T` timeline, `E` entity, `V` zero-padded version, `I` inclusion.
Each row has `pk` and `sk`. Materialized lookup rows are updated in the **same
transaction** as the entity, so they support strongly consistent reads. No GSI
lag may influence authorization, cycle detection or publication.

| Operation                              | Partition key / sort key                                                                     | Read and consistency strategy                                                                                                                                                                                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner/security state                   | `OWNER#O` / `STATE`                                                                          | Strong Get; all content writes condition/increment contentEpoch; security writes condition/increment securityEpoch.                                                                                                                                              |
| Timeline/type library and trash        | `OWNER#O#CATALOG` / `TL#id` or `TYPE#id`                                                     | Query prefix, strong, stable ID order; rows contain names/versions/deletion state. Return at most 100; filtered pages may be empty and still have a cursor.                                                                                                      |
| Entity current/detail                  | `OWNER#O#ENTITY#kind#E` / `HEAD`                                                             | Strong Get/BatchGet; retry UnprocessedKeys with bounded jitter, never silently drop them. Full payload fetched only for returned detail/page IDs.                                                                                                                |
| Entity history/restore                 | same entity partition / `REV#V`                                                              | Query backwards, 50 revisions/page, strong; immutable full images. Restore creates next version.                                                                                                                                                                 |
| Source entries/date viewport/list/jump | `OWNER#O#TIMELINE#T` / `ENTRY#entryId`                                                       | Query **all** active metadata rows for each reachable source; follow every DynamoDB 1 MiB page, then overlap/filter/sort and page the merged result. Metadata has ID, version, source, type, title and date envelope; no descriptions. No start-date-only query. |
| Nested composition/cycle check         | `OWNER#O#TIMELINE#T` / `INCLUDE#sourceId`                                                    | Query adjacency with inclusion ID/version; iterative DFS with path set and visited set deduplicates diamond graphs. Cycle mutation validates proposed graph at a stable owner epoch.                                                                             |
| Inclusion uniqueness/live consumers    | same parent partition / `INCLUDE#sourceId`; `OWNER#O#TIMELINE#sourceId` / `USED_BY#parentId` | Conditional pair creation; reverse lookup for previews/dependencies; both rows removed on soft delete.                                                                                                                                                           |
| Type dependency check                  | `OWNER#O#TYPE#typeId` / `ENTRY#entryId`                                                      | Query Limit 1 proves referenced; page all for a reassignment preview. Ignore references removed by the same atomic batch.                                                                                                                                        |
| Search                                 | authorized closure metadata, then current heads in groups <=100                              | Case-insensitive substring over title, description and reference text; no fuzzy/ranked search contract. Title prefilter is insufficient for other fields, so full-field search progressively reads heads and returns explicit progress. No paid search index.    |
| Batch listing/undo                     | `OWNER#O#BATCHES` / `COMMIT#timestamp#batchId`; `OWNER#O#BATCH#id` / `HEAD`                  | Chronological owner-only Query and direct receipt Get; receipt references immutable revisions.                                                                                                                                                                   |
| Proposal/approval                      | `OWNER#O#PROPOSAL#id` / `HEAD`, `OP#nn`, `APPROVAL`                                          | Strong Get; approved digest/version checked in transaction; owner-only. TTL 7 days on unused proposal/approval; application checks expiry even before TTL deletion. Applied batch/history persist.                                                               |
| Retry                                  | `OWNER#O#IDEMPOTENCY` / `hash`                                                               | Strong Get after timeout/cancellation; receipt written atomically with batch. Retain committed compact receipts indefinitely so expiry cannot duplicate an old apply/undo.                                                                                       |
| Share lookup/scope                     | `SHARE#tokenHash` / `HEAD`                                                                   | Strong Get resolves owner/root; no plaintext token stored. Owner catalog has `SHARE#grantId` lookup; <=200 source IDs and <=16 KiB per grant. Larger scope uses separately previewed grants for now, with an explicit limit error, never hidden sources.         |
| Shared viewport/detail/media metadata  | grant lookup + authorized adjacency/metadata + referenced type heads                         | Traverse only nodes in the grant, then serve entries whose canonical source is in that reachable set. Return only types referenced by those entries; no owner library, revisions, proposals or credentials.                                                      |
| Current/recovery export                | selected roots and transitive closure; heads and optionally revisions                        | Owner-only resumable export at an unchanged content epoch, verified before publishing the manifest. On concurrent change restart; do not label a mixed export consistent.                                                                                        |

This is efficient for the declared fixture, not constant-time interval indexing.
At 10,000 rows averaging 1 KiB, one cold closure load reads ~10 MiB / 2,500 strong
RRUs, at least 20 source Queries; worst allowed row size doubles it. Narrow windows
still read the entire closure metadata. Parallelize at most four Queries; cache
metadata in Lambda memory by `(ownerId, contentEpoch, sourceId)`, 32 MiB LRU, 60s
expiry. No ElastiCache. A cold full-field search may additionally read ~40 MiB at
4 KiB/entry. Public search performs this only over authorized sources.

For larger collections use resumable source/page processing, explicit progress
and temporary owner-bound work buffers (encrypted private S3, 24h lifecycle).
Keep exact top 101 ordered matches during scans, or sort 4 MiB runs and merge for
exports. Initial work slice: 32 MiB scanned or 5s, four-way I/O; return 202 plus an
opaque continuation instead of partial results labeled complete. All continuation
requests recheck content epoch and current authorization. Static product counts
are unlimited; response, batch, share-scope and per-request work limits are explicit
operational bounds. Large graphs similarly use a continuation, not recursion
depth failure or silent omission. Streaming exports/imports never require one
unbounded Lambda payload. If these work slices repeatedly miss the budget at real
scale, revisit a range index or PostgreSQL with measured evidence.

### Read boundary and pagination

Read owner state strongly before assembling a view; strongly reread it after all
Query/BatchGet pages. If contentEpoch changed, retry once then return 409
`VIEW_CHANGED`. Every content transaction advances it, so this prevents fractured
multi-item reads across transactional publication. Read failures yield no partial
"complete" response. API pages default 50, max 100 summaries/256 KiB; details are
separate. History defaults 20, max 50/256 KiB. Follow the byte boundary as well as
row count. Cursors bind owner/share ID, query digest, content epoch, last
`(anchor, id)` or provider continuation, expiry (15 minutes), and grant version;
HMAC and base64url encode. The in-memory proof uses an offset at a fixed epoch
as an equivalent paging model; production does not trust caller offsets.

A write between pages invalidates the cursor: refresh the view, do not quietly
skip or duplicate entries. This is live pagination, not a historical composite
snapshot. Source/type changes invalidate the owner epoch. Public grant changes
invalidate the cursor separately. Search continuations bind the same values and
cannot reuse another view's work buffer.

## Mutation, approval and recovery boundary

Proposal headers contain digest, status and operation count, not the entire
before/after payload. Store each operation as an immutable `OP#nn` row <=40 KiB;
mark the <=16 KiB header ready only after verifying all rows and their digest.
Apply checks that ready header and approval in its transaction. Incomplete staging
is never applicable. Large import manifests are private S3 objects with checksums
referenced by a small job header; approval binds the manifest digest and ordered
chunk digests. Compact committed batch receipts contain revision pointers, not
all before/after images, and must remain <=16 KiB.

One service accepts validated domain commands from web, MCP and import. Clients
cannot submit DynamoDB expressions. Every operation, including single edits,
uses the batch path; generic content operations cannot name ShareGrant, Owner,
authentication or approval records.

1. Authorize principal, client and action. Validate the whole proposed batch,
   references, active types and endpoints. Read affected entity versions and graph
   between equal strong owner epochs. Reject duplicate entity operations; combine
   changes to a single entity before preview. Compute all lookup-row changes.
2. Produce canonical JSON (fixed schema/field ordering, UTF-8) and SHA-256 digest
   of exact operations, expected versions, content epoch and actor scope. Preview
   shows all before/after differences, live consumers, type/global impacts, item
   counts, estimated bytes and chunks **before submission**.
3. Per batch: **1–20 logical entities, <=90 unique DynamoDB transaction actions,
   <=2 MiB total item bytes**. Count removed as well as inserted lookup rows,
   revision envelopes, receipts, owner update and approval condition. Each physical
   item appears once; put the condition on its Update/Put rather than adding a
   second ConditionCheck. Smaller batches are required when physical expansion
   exceeds a bound. This leaves margin below AWS's 100 actions/4 MiB, and below
   its 400 KiB/item ceiling. [AWS transaction contract](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html).
4. TransactWriteItems conditionally advances contentEpoch, checks every expected
   entity version, writes current heads, all lookup rows, first/subsequent full
   revisions, ChangeBatch, batch listing and idempotency receipt together. Check
   owner enabled/security epoch and valid approval where applicable. No current
   content is written during preview/staging. Any condition failure publishes
   **nothing**. Owner epoch catches races involving graph/references even when
   another batch touched different entities. This intentionally serializes the
   single owner's writes and can cause conservative unrelated-write conflicts.
5. On a network timeout, strongly read the idempotency receipt before retry. Same
   digest returns the original result, including for undo. Missing receipt may
   retry the identical conditional transaction. Different digest is 409; stale
   versions require a fresh preview, never automatic overwrite. Authorization is
   still enforced for a replay. AWS's short client-token window is supplemental.

Specific authorized MCP additions/edits may apply directly through a narrow
single-entry command. MCP cannot infer conversational intent securely: grant a
short-lived owner-created delegation for direct single-entry writes, limited to
selected sources/actions, and rely on #102's host tool confirmation for the exact
call. It cannot authorize multi-entry rewrites, deletes, moves or type-wide edits.
Store delegations as `OWNER#O#DELEGATION#id` / `HEAD` with owner, client,
source/action allowlists, version, active flag and expiry (at most one hour).
Require its unchanged version/active state in the publication transaction;
revocation increments securityEpoch. They grant no share/approval privileges.
Multi-entry rewrites, deletes, moves and type-wide edits require an immutable
proposal and **server-held approval receipt** issued
by the authenticated owner web review page. Apply accepts proposal ID/digest only,
not replacement operations or a model-supplied `approved: true`. One valid receipt
is consumed in the transaction and reused on identical retry; do not ask again
for that exact approved batch. Open-ended review exposes read/propose only.
If #102 proves a cryptographically trustworthy host approval callback, it may
replace the web receipt UX; host prose alone cannot. #102 must verify this flow
is usable in Work, including opening the review link, before real integration.

Imports are ordered dependency-first (types/timelines, entries, then inclusions).
Validate the **entire bundle** before any chunk; stage the immutable plan and
display all chunk boundaries. Each chunk has its own reviewed digest, named batch
and receipt. One owner approval may cover the exact ordered chunk manifest, with
expected predecessor epochs; approval is not repeated unless content/plan changes.
Each chunk becomes live atomically and independently. Crash on chunk 2 of 3 means
chunk 1 remains visible; report partial completion and allow resume or reverse-order
undo. **No cross-chunk atomicity is promised.** Recheck epoch/dependencies before
each chunk; an outside edit halts the remaining plan. Size changes require a new
preview. New imported sources remain unshared, though imports modifying existing
shared sources can change their public views; make that impact explicit.

Undo/restore is a new conditional batch, never log reversal. Every affected current
version must equal the target batch's after-version. A subsequent edit conflicts
even if its text looks identical. Undo of creation soft-deletes that object and
fails if new dependent entries/inclusions exist outside the undo; do not cascade.
Read source-entry, reverse-inclusion and type-reference partitions under the epoch
to detect these dependencies. Restored links must remain acyclic, endpoints and
types active. Restoring a source affects live consumers but never revives grants.
Deleting a timeline leaves outbound inclusion identities/history recoverable;
graph traversal ignores deleted timelines, and restoring one revalidates its
outbound/inbound paths. Grant operations have a separate security audit trail.

## Identity and MCP

Select Cognito **Lite**, classic hosted login, one administrator-created account,
password + TOTP, public self-sign-up disabled. No SMS, paid threat protection or
custom authentication server. Separate public OAuth clients for web and local
Codex; a separately registered client for the ChatGPT connection. Owner mapping
uses immutable issuer/sub. Email changes cannot transfer ownership.

Use authorization code + PKCE S256, state, exact callback allowlists and resource
binding. Cognito supports access-token audience binding via the `resource`
parameter. Choose distinct resource URLs for owner API and MCP; access scopes
are `read`, `propose`, `write`, `undo`, with `share:manage` and `approval:issue`
available only to the web client. Validate signature/JWKS, issuer, `token_use`,
audience, expiry, client ID, scope and owner mapping on every request. Reject ID
tokens. [Cognito authorization endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html).

MCP uses HTTPS Streamable HTTP `/mcp` with JSON responses, no durable SSE session
or background connection. Long operations return work IDs for polling. Publish
protected-resource metadata, advertise Cognito's actual discovery issuer, and
return a proper Bearer challenge on 401. Use preregistered OAuth clients, so this
design does not depend on Cognito providing DCR/CIMD. OpenAI documents predefined
clients and OAuth resource/audience enforcement.
[OpenAI authentication](https://developers.openai.com/plugins/build/auth).

Codex supports `--oauth-client-id` and plugin `oauth.clientId`; choose a fixed
callback listener port and register the exact displayed callback including any
server-specific suffix. Do not advertise issuer-response support Cognito does
not actually provide. ChatGPT uses the callback shown on its connection management
page. [Codex MCP registration](https://learn.chatgpt.com/docs/extend/mcp).
The disposable proof must verify Cognito accepts the exact loopback host/port,
refresh preserves audience, and discovery advertises S256 correctly. No homemade
OAuth proxy is an assumed fallback.

#102 is the explicit live compatibility gate: test local Work on Mac, Codex, and
hosted Work separately; record app version, account policy, configured clients,
callback/refresh behavior, approval receipt and apply/undo evidence. Local success
does not establish hosted support. Developer-mode/tunnel/private plugin testing
is distinct from public publication.
[OpenAI connection testing](https://developers.openai.com/plugins/deploy/connect-chatgpt).
No external account configuration, installation or paid service was performed here.

Access tokens expire in five minutes; refresh lifetime seven days. Use host secure
credential storage; web tokens stay in memory. On owner disable or emergency
logout, advance `tokensValidAfter`/securityEpoch and reject older tokens, in addition
to Cognito refresh revocation; JWT validation alone cannot enforce immediate logout.
Do not cache positive authorization. CORS is an origin policy only: owner web
origin allowlist, validated Origin for browser MCP requests, OAuth for all clients.
Non-browser callers get no exception. MCP has no share-management or permanent
delete tool/route permission, even if it supplies the owner's subject.

## Public scope, live data and revocation

Generate 256 random bits per share token, show it once as `/s#token`; the browser
sends it in an authorization header, never an API path/query. Store only its hash;
redact headers, fragments, proposal text and source URLs from logs. `Referrer-Policy:
no-referrer`, no third-party analytics. Owner must select the complete authorized
paths: a permitted descendant behind a private intermediary remains unreachable.
Return a preview of sources/lanes, not just a root checkbox. A new inclusion adds
no permission; unknown reachable sources remain excluded until explicitly added.

Public requests read current owner state and ShareGrant strongly, compute the
induced authorized graph, then re-read both together with TransactGetItems before
return. Require unchanged contentEpoch, securityEpoch and grant version, active
grant, active root, unexpired token and publicEnabled. Read failure fails closed.
This final check is the read's authorization point: a response already authorized
and in flight may finish after revocation; bytes already downloaded cannot be
recalled. All subsequent checks deny it. Public responses, errors and work buffers
use `Cache-Control: no-store`; CloudFront caches static assets only. No signed S3
URL to private/share data bypasses this check. Warm content caches, staged search
results and continuations never cache permission; reuse revalidates current scope.

Views are source-scoped, not filtered subsets. Sharing a timeline authorizes its
current/future live entries and referenced type labels. Filters hide presentation
only. Moving an entry into/out of a shared source changes exposure and requires an
impact preview. No private revisions, proposals, global inventories, actor account
fields or share credentials appear in anonymous DTOs. Source links retain their
external access rules; an image URL may disclose its own external URL as selected
content, never a server credential.

## Retention, portability and operations

Current content, tombstones, revisions, committed batch/idempotency records and
security audit events have no automatic expiry. Temporary unused proposals last
7 days; staging/work files 24h; operational logs 30 days. These TTLs never remove
recovery history. Enable production and test PITR (35 days), deletion protection,
RETAIN; retain two monthly on-demand backups with older backup expiry explicit in
the backup policy. Backups recover infrastructure failure, revisions recover edits.

Export `timelines.bundle.v1` JSON with `mode: current | recovery`, bundle ID,
export time, calendar contract version, selected roots, source IDs/inclusion graph,
referenced types, entries, references and image metadata; recovery also carries
revisions and batch provenance (export-safe actor labels, never issuer/sub or
account identifiers). Both omit grants/tokens, auth state, approvals,
owner account data and pending proposals. External image bytes and linked document
contents are excluded. Multi-part export has a manifest with part order/count,
SHA-256 and byte lengths; no manifest becomes downloadable before complete epoch
validation. Private authenticated downloads only.

Import preflights schema/calendar version, sizes, hashes, URLs, graph, dates and
all references. Use <=4 MiB streamed parts, <=100 MiB per import job; larger
collections use explicit jobs, no fixed stored-entry count. Default remaps every
ID and owner, retaining old IDs only as provenance. Preview type collisions;
explicit reuse must match owner-selected IDs/definitions, never name-only merge.
Explicit update mode needs destination versions and the same batch limits.
Imported recovery history is immutable provenance, stored separately under
`OWNER#O#IMPORT#jobId` / `HISTORY#oldId#V`, streamed in bounded chunks; it never
replaces destination revisions or claims the old actor authenticated here.
Record mapping and history-progress in the job manifest. New destination revisions
start at v1 with the actual importing principal. Reject broken/cyclic bundles before
publication; invalid later transport chunks cannot be called a complete import.

#113 should configure API stage 10 rps/20 burst, owner mutation 2 rps/5 burst,
per-share application limiter 2 rps/10 burst, Lambda reserved concurrency 5 with
512 MiB/10s timeout, and bounded DynamoDB on-demand maximum throughput with alarms.
Rate-limit keys are hashed (`RATE#hash` / `WINDOW#minute`); atomic counters expire
after one hour and do not advance contentEpoch. Authorization stays independent.
Limits return 429 with retry guidance; account capacity availability must be checked.
HTTP API throttles are best effort, not guaranteed cost containment. Never use
provisioned concurrency to achieve these controls.

Budget notifications at $5/$10/$15 actual and $20 forecast, cost allocation tag
`Project=timelines`, alarms for errors/throttles/latency and abnormal public volume.
Use built-in service metrics; bound/redact logs. Investigate spend before relaxing
limits. Emergency runbook: set publicEnabled false (security epoch increment),
revoke affected grants and direct-write delegations, optionally disable owner
tokens; stop the pipeline, set Lambda concurrency to zero if attack continues,
and disable public API routes. Static maintenance page remains. Preserve table,
PITR and backups; expect retained storage charges while stopped. Restore into a
new isolated table, verify counts/revisions/graph and owner mapping, and use current
security state; **never reinstate backup-era grants**. Default all sharing disabled
after disaster recovery, issue fresh tokens only on owner action. #114 tests this
procedure before launch. No resource destruction is authorized by this record.

## Reproduce the proof and remaining validation

From the repository root, Node 24 and pinned pnpm:

```sh
node --test apps/personal/timelines/docs/proof/*.test.mts
node apps/personal/timelines/docs/proof/cost.mts
pnpm exec tsc --noEmit --strict --skipLibCheck --module nodenext --target es2022 --allowImportingTsExtensions --typeRoots packages/api-core/node_modules/@types apps/personal/timelines/docs/proof/*.mts
```

The typecheck uses the already-installed Node declarations from `api-core`; the
proof is not a new deployable package. [Access model](proof/access.mts),
[publication model](proof/mutations.mts) and [tests](proof/architecture.test.mts)
are disposable specifications, not AWS SDK adapters. They prove overlap versus
the faulty start-date strategy, complete page traversal, diamond deduplication,
stable sorting/paging and stale cursors, share revocation against warm data,
conditional all-or-nothing publication, retries, undo conflicts, concurrent cycle
rejection, and 45 rows published as 20/20/5 with failure in chunk two.

Observed on 2026-09-25, Apple M4 Pro / macOS arm64 / Node v24.15.0: 10,000 synthetic entries,
20 sources, 1,283,303 JSON metadata bytes, 83 forced 16 KiB pages, 4,151 overlap
matches. One warm in-memory filter/sort/page run across 100 samples had p95 <1ms.
JSON bytes omit DynamoDB encoding/attribute overhead. This does **not** measure
AWS transactions, wire pagination/RCUs, cold starts, DOM rendering or phone latency.

Implementation gates, not silent reductions of product scope:

| Gate                           | Concrete next validation                                                                                                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #102 authentication/workflow   | Cognito discovery, preregistered callback, audience/refresh, Work local and hosted availability, exact approval receipt UX. If incompatible, amend this decision before production auth; do not claim tested compatibility.                                                        |
| #103/#108 performance          | Same 10k/20-source fixture: desktop first usable viewport p95 <=2s cold / <=500ms warm; pan/zoom main-thread work p95 <=16ms. Phone list first usable <=3s on throttled 4G, pan p95 <=33ms, <=50 MiB app data memory. Record actual device/browser/network and whether goals pass. |
| #104 contracts                 | Implement and test actual BCE/CE, precision, leap dates and bound arithmetic; the proof's integers intentionally do not implement historical dates.                                                                                                                                |
| #105/#106/#109 storage         | SDK/DynamoDB Local integration guards for physical item/byte expansion, conditional rollback, UnprocessedKeys, deleted dependencies and epoch reads; deployed transaction/billing behavior in isolated test stage before release.                                                  |
| #110/#112 security/portability | Adversarial DTO/cursor tests, revoked staged reads, content moves, restore without grant revival, recovery-bundle round trip, large job resume and history provenance.                                                                                                             |
| #113/#114 operations           | Price refresh, latency/read-unit/cache-hit measurements, alerts, backups and recovery drill. No paid environment or deployment was created by #101.                                                                                                                                |

Validation run: `pnpm install --frozen-lockfile`, `pnpm format:check`, `pnpm lint`,
`pnpm typecheck`, `pnpm test` and `pnpm build` completed successfully; all eight
focused proof tests and the standalone strict typecheck passed. Installation's
`simple-git-hooks` preparation emitted an `ENOTDIR` warning for the managed
worktree's `.git` file; formatting was checked explicitly. Standard workspace
checks do not discover this docs-only prototype, so run its commands above too.

Core storage, batch, scope and identity choices are fixed here. The desktop/account
capability and measured cloud/UI budgets above remain explicitly unverified.
