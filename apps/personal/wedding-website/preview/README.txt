PUBLIC READ-ONLY WEDDING PREVIEW — REBUILD HANDOFF

This separate preview serves the normal Home, FAQ, Registry and Wedding Day pages.
RSVP submission is disabled. /admin uses the unchanged admin Bearer-key contract.
No Cognito, owner login, cookies, credentials or guest records are included here.
Production App, stack, domains and deployment workflows are unchanged.

Use the prepared environment activation wrapper and repository dependencies:
  /workspace/.onboarding-tools/run node apps/personal/wedding-website/preview/prepare.mjs /tmp/NEW-preview-build
  /workspace/.onboarding-tools/run node apps/personal/wedding-website/preview/verify-built.mjs /tmp/NEW-preview-build
  /workspace/.onboarding-tools/run pnpm --filter wedding-website-api test
  /workspace/.onboarding-tools/run pnpm --filter wedding-website-web test
  /workspace/.onboarding-tools/run pnpm --filter wedding-website-infra test
No install, login, AWS operation or upload is performed by these scripts.

Configuration examples are deliberately synthetic/incomplete. Obtain authorized
real account/table/KMS metadata separately; do not commit it. Set createdAt at
actual deployment start and expiresAt exactly24hours later. Use a unique unused ID.
Set sourceRevision to the checked-out source commit. adminAccessKeySha256:null
explicitly disables all admin reads with503 before persistence using the existing
unconfigured sentinel. This requires no credential generation. To enable admin
later, accept ONLY a user-supplied SHA256 hash and retain the original expiry.
Never put the raw admin key in agent tools, source, logs or build assets.

Local synthesis from wedding-website-infra:
  /workspace/.onboarding-tools/run pnpm exec tsx bin/wedding-preview.ts CONFIG ARTIFACT_DIR NEW_OUT api-only
  /workspace/.onboarding-tools/run pnpm exec tsx bin/wedding-preview.ts CONFIG ARTIFACT_DIR NEW_OUT full RESOLVED_CONFIG
API-only creates one inert API. Full adds18resources, retaining its logicalID and
properties. Five external IAM objects (execution role/inlinepolicy/three distinct
runtime boundaries) complete the24-object scope. The scripts ONLY produce local
files; future CloudFormation operations require separate approved execution scope.

Exact asset keys are CDK AssetStaging.assetHash+'.zip' for frontend/backend folders.
The synth checks supplied keys against the actual template. Outputs include the
reviewed-policies directory, LOCAL-REVIEW.json and cloudformation-change-set-input.json.
Use dedicated execution RoleARN, direct TemplateBody submission and only two zip
uploads. Never default cdk deploy/cdk-assets or production deploy/publish scripts.
The general CDK assets manifest also contains a templateobject; do not upload it.
Archive each handler directory contents at zip root (index.js and frontend web/).

Before full update, resolve actual API ID and exact bootstrap stack ARN, artifact
KMS key ARN and bucket-key setting; fill resolved config outside Git. Replace the
bootstrap API-root policy with exact-API policy; create/attach three distinct
boundaries that execution cannot alter/remove. Review complete template/policies/
asset hashes, not only inventory. No shared AdministratorAccess role is permitted.
Initial CreateRole trusts and Lambda code remain important review surfaces even
though the boundaries restrict subsequent AWS actions.

Offline exported change-set guard:
  /workspace/.onboarding-tools/run pnpm exec tsx bin/wedding-preview-check-change-set.ts EXPORTED_JSON EXACT_STACK_ARN api-only
  /workspace/.onboarding-tools/run pnpm exec tsx bin/wedding-preview-check-change-set.ts EXPORTED_JSON EXACT_STACK_ARN full
It rejects unexpected IDs/types, remove/replace/conditionalreplace and incomplete
initial additions. It is not a guard for arbitrary later updates. Verify API's
actual physical ID and retained identity before execution. Stop on AccessDenied;
never broaden policies silently. Stage creation is scoped to exact API at IAM;
$default-only is fixed in the reviewed template, not an unsupported IAM condition.

Only backend has bounded eventually-consistent Scan on explicit existing table;
no writes or migrations. Frontend has no table access. Cleanup can DeleteStack
only its own stack. Execution cannot modify production/shared roles, bucket,
table, boundaries or itself. No Cognito resource or permission is needed.

Verify public pages/assets, disabled RSVP UI and HTTP mutations, anonymous/random
key admin denial, scoped liveIAM, and expiry/schedule. With null hash expect503
for all admin requests. Agent must not read production records. Any user reads
must stay within separately authorized limits.

At expiry runtime denies all requests independently of cleanup. Scheduler starts
DeleteStack, then CloudFormation continues under external execution role after
schedule/role deletion. Keep execution role and boundaries until DELETE_COMPLETE;
then authorized operator removes only those five external IAM objects. Shared
asset objects remain under existing GC; no bucket/object-deletion grant is added.
Deletion acceptance is not completion; parent/operator must verify cleanup.

Local evidence before transfer: API81tests/8files and infra42/3 rerun after disabled
mode, unchanged web173/29 =>296tests/40files. Typechecks/lint, synthesis, public
bundle smoke and actual bundled disabled backend passed. Independent review found
no blocking issue. LiveIAM/auth/assetretrieval/teardown remain unverified.
Source-only transfer; no approval transcripts, account inventory, session files,
real credentials, PII, binary archives or generated cloud assemblies are committed.
