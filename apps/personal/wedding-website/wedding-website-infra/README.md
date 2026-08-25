# Wedding Website Infrastructure

This package provides static production hosting and a single deployment
pipeline for the wedding website. It does not include an API, database, guest
data, authentication, or additional deployment environments.

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
```

The stack reuses the shared `bphillips.dev` hosted zone, wildcard certificate,
and GitHub Actions OIDC provider. The custom hostname and direct CloudFront
hostname are publicly readable; the S3 bucket remains private and is accessible
only through CloudFront.

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
```

`cdk diff` contacts AWS but does not apply the stack:

```sh
pnpm aws:login:sandbox
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
```

## Deployment bootstrap

The following steps create or change AWS/GitHub resources. Run them only after
deployment is explicitly approved.

1. Verify the sandbox identity:

   ```sh
   pnpm aws:login:sandbox
   aws sts get-caller-identity --profile sandbox-admin
   ```

2. Review the diff, then perform the first deployment:

   ```sh
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra deploy
   ```

   The deploy script publishes the current web build only after the
   infrastructure deployment succeeds.

3. In the AWS CodeConnections console, complete the GitHub handshake for
   `wedding-website-prod-source` if its status is `PENDING`.

4. Ensure the GitHub repository variable `AWS_ACCOUNT_ID` is set to
   `498283327683`. The wedding workflow assumes the
   `wedding-website-prod-starter` role through the shared OIDC provider; do not
   create long-lived AWS keys.

5. Confirm unauthenticated requests to both `wedding.bphillips.dev` and the
   CloudFront distribution hostname return the published HTML and assets.

## Destroy

Destroying the stack removes the site bucket, distribution, DNS aliases, and
pipeline. Confirm the exact account, region, and stack before running:

```sh
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra destroy
```

This command is destructive and must not be run without explicit confirmation.
