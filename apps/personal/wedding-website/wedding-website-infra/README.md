# Wedding Website Infrastructure

This package prepares the protected static hosting and single production
deployment pipeline for the wedding website. It does not include an API,
database, guest data, or additional deployment environments.

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
  -> CloudFront viewer-request Basic Auth gate
  -> private S3 origin
```

The stack reuses the shared `bphillips.dev` hosted zone, wildcard certificate,
and GitHub Actions OIDC provider. The preview gate is attached to the default
CloudFront behavior, so it also protects direct requests to the distribution
hostname and every static asset path.

`niamhandbrandon.com` is intentionally not part of this stack. Do not add DNS
records, certificates, aliases, redirects, parameters, or outputs for that
domain during preview deployment.

## Local validation

These commands do not apply AWS changes:

```sh
pnpm --filter wedding-website-infra lint
pnpm --filter wedding-website-infra typecheck
pnpm --filter wedding-website-infra test
pnpm --filter wedding-website-infra build
pnpm --filter wedding-website-infra synth
```

`cdk diff` contacts AWS. After signing in and making the preview password
available locally, run:

```sh
pnpm aws:login:sandbox
export WEDDING_PREVIEW_PASSWORD="$(aws secretsmanager get-secret-value \
  --profile sandbox-admin \
  --region us-east-1 \
  --secret-id wedding-website/prod/preview-password \
  --query SecretString \
  --output text)"
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
unset WEDDING_PREVIEW_PASSWORD
```

Never commit the password or place it in a checked-in `.env` file.

## One-time bootstrap

The following steps create or change AWS/GitHub resources. Run them only after
the deployment is explicitly approved.

1. Verify the sandbox identity:

   ```sh
   pnpm aws:login:sandbox
   aws sts get-caller-identity --profile sandbox-admin
   ```

2. Create the alphanumeric 32-character preview password in Secrets Manager
   without printing it:

   ```sh
   WEDDING_GENERATED_PASSWORD="$(aws secretsmanager get-random-password \
     --profile sandbox-admin \
     --region us-east-1 \
     --password-length 32 \
     --exclude-punctuation \
     --query RandomPassword \
     --output text)"
   aws secretsmanager create-secret \
     --profile sandbox-admin \
     --region us-east-1 \
     --name wedding-website/prod/preview-password \
     --description "Temporary password for the protected wedding preview" \
     --secret-string "$WEDDING_GENERATED_PASSWORD"
   unset WEDDING_GENERATED_PASSWORD
   ```

3. Retrieve the password, save it in the intended password manager, and export
   it only for the deployment shell. The HTTP Basic Auth username is `preview`.

   ```sh
   export WEDDING_PREVIEW_PASSWORD="$(aws secretsmanager get-secret-value \
     --profile sandbox-admin \
     --region us-east-1 \
     --secret-id wedding-website/prod/preview-password \
     --query SecretString \
     --output text)"
   ```

4. Review the diff, then perform the first stack deployment only when approved:

   ```sh
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra diff
   AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra deploy
   unset WEDDING_PREVIEW_PASSWORD
   ```

   The distribution and viewer-request gate are created in the same stack
   deployment. The deploy script publishes the current web build only after
   the protected infrastructure succeeds.

5. In the AWS CodeConnections console, complete the GitHub handshake for
   `wedding-website-prod-source` if its status is `PENDING`.

6. Ensure the GitHub repository variable `AWS_ACCOUNT_ID` is set to
   `498283327683`. The wedding workflow assumes the
   `wedding-website-prod-starter` role through the shared OIDC provider; do not
   create long-lived AWS keys.

7. Confirm an unauthenticated request to both `wedding.bphillips.dev` and the
   CloudFront distribution hostname returns `401`, then confirm the `preview`
   username and stored password can load HTML and static assets.

## Rotate the preview password

Generate a new 32-character alphanumeric value, store it as the current secret
version, and rerun the production pipeline so CloudFormation updates the
CloudFront Function:

```sh
export WEDDING_PREVIEW_PASSWORD="$(aws secretsmanager get-random-password \
  --profile sandbox-admin \
  --region us-east-1 \
  --password-length 32 \
  --exclude-punctuation \
  --query RandomPassword \
  --output text)"
aws secretsmanager put-secret-value \
  --profile sandbox-admin \
  --region us-east-1 \
  --secret-id wedding-website/prod/preview-password \
  --secret-string "$WEDDING_PREVIEW_PASSWORD"
aws codepipeline start-pipeline-execution \
  --profile sandbox-admin \
  --region us-east-1 \
  --name wedding-website-prod
unset WEDDING_PREVIEW_PASSWORD
```

Save the new value before unsetting it. CodeBuild reads the current Secrets
Manager value and masks that exact value in its logs; build commands must never
transform or echo it.

## Remove preview protection later

Removal requires a deliberate code change: remove the CloudFront Function
association and `PreviewPassword` parameter, remove the Secrets Manager mapping
and CDK parameter flag from the Prod deployment command, deploy that change,
and verify the intended public behavior. Delete the Secrets Manager secret only
after the protected distribution update is complete.

## Destroy

Destroying the stack removes the site bucket, distribution, DNS aliases, and
pipeline. Confirm the exact account, region, and stack before running:

```sh
AWS_PROFILE=sandbox-admin pnpm --filter wedding-website-infra destroy
```

This command is destructive and must not be run without explicit confirmation.
