# Wedding Website Infrastructure

This package defines the wedding website's single production stack and
pipeline. It contains static web hosting plus the create-only RSVP DynamoDB,
Lambda, and HTTP API infrastructure. It does not contain guest authentication,
admin tooling, messaging, or additional deployment environments.

## Architecture

```text
GitHub main push
  -> reusable project GitHub Actions workflow
  -> wedding-website-prod CodePipeline
       -> Source
       -> Validate
       -> Prod
            -> deploy WeddingWebsiteStack
            -> build wedding-website-web
            -> publish dist to private S3
            -> invalidate CloudFront

wedding.bphillips.dev
  -> Route 53 A/AAAA aliases
  -> CloudFront with HTTPS redirects
  -> private S3 origin

wedding-api.bphillips.dev
  -> Route 53 A alias
  -> API Gateway HTTP API (POST /rsvp only)
  -> Node.js Lambda
  -> DynamoDB PAY_PER_REQUEST
```

The stack reuses the shared `bphillips.dev` hosted zone, wildcard certificate,
and GitHub Actions OIDC provider. The API uses exact production CORS for
`https://wedding.bphillips.dev`, `POST`, `content-type`, and `idempotency-key`;
CORS is not authentication. The API's default stage is throttled to 5 requests
per second with a burst of 10, and its generated `execute-api` endpoint is
disabled in steady state.

`ApiBaseUrl` and `RsvpTableName` join the existing web outputs. Publishing reads
`ApiBaseUrl` and passes it to Vite as `VITE_API_BASE_URL`, but the frontend does
not submit to the API until the follow-on integration issue.

The DynamoDB table has point-in-time recovery, deletion protection, retained
stack-removal behavior, and no TTL or secondary indexes. Lambda and API access
logs retain operational fields for 30 days. Two alarms require errors in two
consecutive five-minute periods; they currently have no notification action.

The production hostname is configured only when the app is intended to receive
traffic. Do not add a separate preview password or site-wide authentication
gate unless it is explicitly requested.

`niamhandbrandon.com` is intentionally not part of this stack. Do not add DNS
records, certificates, aliases, redirects, parameters, outputs, or workflows
for that domain.

## Local validation

These commands do not apply AWS changes:

```sh
pnpm --filter wedding-website-infra lint
pnpm --filter wedding-website-infra typecheck
pnpm --filter wedding-website-infra test
pnpm --filter wedding-website-infra build
pnpm --filter wedding-website-infra synth
pnpm --filter wedding-website-api test
pnpm --filter @repo/infra-patterns test
```

`cdk diff` contacts AWS but does not apply the stack:

```sh
pnpm aws:login:sandbox
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
```

Review the diff for the table, Lambda, least-privilege DynamoDB policy, API
route/domain/stage, log groups, alarms, DNS alias, outputs, and pipeline changes.
These checks do not create guest data or apply the stack.

## Deployment safety

Pushing this infrastructure to `main`, manually starting
`wedding-website-prod`, or running `cdk deploy` is a production apply action.
Do none of those without explicit approval in the executing session. A local
implementation, synth, and authenticated `cdk diff` are not apply actions.

The first approved API rollout uses two stages:

1. Deploy the reviewed stack with the generated endpoint temporarily enabled:

   ```sh
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra exec cdk deploy -c disableExecuteApiEndpoint=false --require-approval never
   ```

2. Prove `https://wedding-api.bphillips.dev` with synthetic data only, then
   deploy the steady-state source without that override and verify the custom
   domain still works while the generated endpoint is disabled.

Normal deployment verification is:

1. Verify the sandbox identity:

   ```sh
   pnpm aws:login:sandbox
   aws sts get-caller-identity --profile sandbox-admin
   ```

2. Review the diff and monitor the existing pipeline after the approved push:

   ```sh
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
   aws codepipeline get-pipeline-state --name wedding-website-prod --profile sandbox-admin --region us-east-1
   ```

   The Prod build compiles shared/API/infra, deploys the same stack, validates
   its outputs, builds the web app with `VITE_API_BASE_URL`, publishes to S3,
   and invalidates CloudFront.

3. Verify the deployed outputs and table posture:

   ```sh
   aws cloudformation describe-stacks --stack-name WeddingWebsiteStack --profile sandbox-admin --region us-east-1
   aws dynamodb describe-table --table-name <RsvpTableName> --profile sandbox-admin --region us-east-1
   ```

4. Use a new UUID idempotency key and clearly synthetic `.test` contact data for
   the manually approved smoke check. Verify `201`, exact replay `200`, changed
   payload `409`, exactly one submission plus one idempotency item, and absence
   of submitted values in Lambda/API logs. Report whether the synthetic records
   were retained; never silently delete production records.

No normal automated test writes to the production table.

## Destroy

Destroying the stack removes the site bucket, distribution, DNS aliases, and
pipeline. Confirm the exact account, region, and stack before running:

```sh
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra destroy
```

This command is destructive and must not be run without explicit confirmation.
