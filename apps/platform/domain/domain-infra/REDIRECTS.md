# Domain redirects

`actions.bphillips.dev` redirects to
`https://brandon-action-console.brandonp321.chatgpt.site/`.
The reviewed central map is `lib/redirects.ts`. The separate
`bin/domain-redirects.ts` entrypoint instantiates only `DomainRedirectsStack`.
The default domain entrypoint and foundation stack are unchanged.

## Behavior

- GET/HEAD `/` on the exact allowed host returns 302 with `Cache-Control:
no-store, max-age=0`. HTTP goes directly to the HTTPS destination with the same
  temporary response; `allow-all` is deliberate to avoid a permanent CloudFront
  HTTP-to-HTTPS 301. HTTPS uses the existing certificate and TLS 1.2 minimum.
- All request query parameters are dropped. No request header, path or query
  contributes to Location. `Referrer-Policy: no-referrer` prevents the source URL
  from being sent as a Referer. Browser fragments are not sent to the server;
  clients may inherit fragments across redirects, so do not put secrets there.
- Unknown hosts (including the distribution hostname) and non-root paths return 404. Methods other than GET/HEAD are rejected by CloudFront (403) or the handler
  (405). CloudFront may reject malformed requests before the function runs.
- This does not proxy the private Site or change its authentication. The browser
  navigates to the Site and must sign in there. No cookies, body or authorization
  are forwarded by this infrastructure.
- CloudFront requires an origin; `redirect-origin.invalid` is a reserved,
  non-resolving placeholder. Every function branch returns a response. There is
  no origin server, bucket or runtime application. A missing function fails closed.

## Exact deployment scope

Account `498283327683`, region `us-east-1`, stack `DomainRedirectsStack`:

| Logical ID           | Resource                      | Impact                                                                   |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| RedirectFunction     | AWS::CloudFront::Function     | `sandbox-domain-redirects`, JS 2.0, auto-published LIVE                  |
| RedirectDistribution | AWS::CloudFront::Distribution | New generated ID, alias actions.bphillips.dev, IPv4/IPv6, PriceClass_100 |
| RedirectAlias0A      | AWS::Route53::RecordSet       | A alias actions.bphillips.dev to new distribution                        |
| RedirectAlias0AAAA   | AWS::Route53::RecordSet       | AAAA alias actions.bphillips.dev to new distribution                     |

Imports: `sandbox-domain-hosted-zone-id` and `sandbox-domain-certificate-arn`.
CloudFront's alias zone is `Z2FDTNDATAQYW2`. No new hosted zone, certificate,
validation CNAME, registrar change, IAM role/policy, OIDC provider, connection,
pipeline, bucket, WAF or logging resource. Existing ACM validation records stay
untouched. These imports prevent deleting the shared exports while in use.
Do not replace pre-existing records or move an existing CloudFront alias without
separate review. Distribution ID and imported zone/certificate IDs must be
resolved by the authenticated executor; they are not guessed here.

## Local checks

From repository root, using the saved environment wrapper for every shell:

```sh
/workspace/.onboarding-tools/run pnpm --filter domain-infra test
/workspace/.onboarding-tools/run pnpm --filter domain-infra typecheck
/workspace/.onboarding-tools/run pnpm --filter domain-infra lint
/workspace/.onboarding-tools/run pnpm --filter domain-infra exec cdk synth --app 'tsx bin/domain-redirects.ts' --path-metadata false --version-reporting false --output /tmp/domain-redirects-cdk
```

The entrypoint uses BootstraplessSynthesizer: no assets, bootstrap deployment
roles or SSM bootstrap parameter are required. Reuse the existing dependencies;
no root lockfile or workflow change is necessary. Tests run generated edge code
and check resource scope, TLS, DNS aliases, unsafe destinations and pipeline
selection. CloudFront's actual JS runtime still needs its authenticated test API
and live smoke verification; Node execution is not a substitute for those.

## Reviewed direct deployment, then verification

No AWS changes have been made by this implementation. The parent coordinates
approval and an already authenticated executor; do not start SSO here.

1. Verify caller account `498283327683`, existing exports, zone ownership and
   public delegation. Describe the exported ACM certificate in us-east-1: require
   ISSUED status and `*.bphillips.dev` coverage. Inspect current actions records,
   all distribution aliases and function names for collisions. Stop on a conflict.
2. Synthesize the isolated entrypoint above. Inspect the JSON template: exactly
   the four resources listed above and no IAM resources. Do not synthesize/deploy
   the foundation entrypoint or use deploy-all.
3. On the authenticated executor, validate the template and create a CREATE
   change set (UPDATE only if this stack already exists), using existing caller
   credentials and no new execution role. Example after scope approval:

   ```sh
   aws cloudformation validate-template --template-body file:///tmp/domain-redirects-cdk/DomainRedirectsStack.template.json --region us-east-1 --profile sandbox-admin
   aws cloudformation create-change-set --stack-name DomainRedirectsStack --change-set-name actions-redirect-review --change-set-type CREATE --template-body file:///tmp/domain-redirects-cdk/DomainRedirectsStack.template.json --region us-east-1 --profile sandbox-admin
   aws cloudformation describe-change-set --stack-name DomainRedirectsStack --change-set-name actions-redirect-review --region us-east-1 --profile sandbox-admin
   ```

   Wait for CREATE_COMPLETE on the change set before inspecting it. These commands
   are for the authenticated executor's shell; when in this saved environment,
   prefix every command with `/workspace/.onboarding-tools/run`.

4. Obtain approval for executing this exact four-resource change set and its
   metered costs. Only then execute it with `cloudformation execute-change-set`,
   wait for stack completion and distribution `Deployed`, and confirm both alias
   records match the stack output and DNS changes are INSYNC. No IAM capabilities
   flag, role creation, bootstrap, or AdministratorAccess grant is needed.
5. Use `cloudfront test-function` against LIVE with its current ETag and a viewer
   request event for the allowed root plus the negative cases in the tests.
   Then run from repo root (substitute the actual distribution domain):

   ```sh
   /workspace/.onboarding-tools/run node apps/platform/domain/domain-infra/bin/verify-redirect.mjs dEXAMPLE.cloudfront.net
   ```

   The script never follows redirects or signs in. It checks A/AAAA resolution,
   trusted TLS, HTTP/HTTPS GET/HEAD, exact Location, stripped queries, no-store,
   unknown paths, distribution hostname and unsafe methods. Finally open the
   friendly URL in a signed-out browser and confirm the Site's own login remains.
   Do not call the redirect live until these checks pass.

## Permission needs

Use existing human/temporary AWS access; this change grants nothing. Needed
operations: STS GetCallerIdentity; CloudFormation ListExports, ValidateTemplate,
CreateChangeSet, DescribeChangeSet, ExecuteChangeSet, DescribeStacks,
DescribeStackEvents, GetTemplate, ListStackResources and DeleteChangeSet for the
named stack/change set; ACM DescribeCertificate on the imported ARN;
CloudFront ListDistributions/ListFunctions for collision checks and
CreateDistribution, GetDistribution, GetDistributionConfig, UpdateDistribution,
DeleteDistribution (rollback), CreateFunction, DescribeFunction, GetFunction,
UpdateFunction, PublishFunction, TestFunction, DeleteFunction (rollback), and
TagResource/UntagResource/ListTagsForResource if the resource provider needs them;
Route53 GetHostedZone/ListResourceRecordSets on the imported zone,
ChangeResourceRecordSets restricted to actions.bphillips.dev A/AAAA, and GetChange.
Creation/list actions that do not support resource scoping require their normal
AWS wildcard resource scope; subsequent writes should scope to the created
resources. This is an action inventory, not a proposed new persistent policy.
If existing access is insufficient, stop and report the denied action/target;
do not create a role or broaden permissions. Deletion of the stack is a separate
approved rollback operation; prefer redeploying a previously reviewed map for a
bad destination. No invalidation is needed for viewer-request responses.

## Cost and independent pipeline plan

This template uses ordinary metered CloudFront, not a newly subscribed flat-rate
plan. No application compute, origin storage or pipeline cost. CloudFront request
and data-transfer charges still apply; Functions list at $0.10 per million
invocations. For an illustrative US traffic rate of $0.01/10,000 HTTPS requests,
10,000 visits cost about $0.011 plus response transfer before account allowances.
Actual pricing, geography and shared free-tier consumption must be confirmed;
there is no hard spend cap. At low personal traffic cost should be very small,
but paid-resource approval is still required.
Sources checked 2026-10-01:
[CloudFront pay-as-you-go](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/).
CloudFront-target A/AAAA alias queries are free; no additional hosted zone is
created: [Route53 pricing](https://aws.amazon.com/route53/pricing/).

Existing application workflows exclude other apps/\*\* paths, and the detector
ignores domain-only changes for Wedding, portfolio, Signal Tracker and Storybook.
All files in this change stay under apps/platform/domain/. Tests
check the actual detector and workflow exclusion. No push or merge is performed.

V1 is manual change-set deployment only. A future independent pipeline should
synthesize only this entrypoint, trigger only redirect-owned files and explicitly
reviewed shared dependencies, and use a dedicated least-privilege execution role
and approval gate. Do not reuse the existing pipeline helper: it creates a
CodeConnections connection, GitHub starter role and AdministratorAccess build
role. Adding .github/workflows/\* currently selects unrelated application pipelines;
first review a separate change to their path filters/detector, with explicit
production-deployment approval. Do not silently add that workflow in this change.
