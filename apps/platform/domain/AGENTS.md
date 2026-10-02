# AGENTS.md - Platform Domain

## Scope

- Domain ownership and shared DNS/certificate foundations live under
  `apps/platform/domain/`.
- The shared GitHub Actions IAM OIDC provider for this AWS account also lives
  here because deploy pipeline starter roles across app stacks import its
  exported ARN.
- Keep this area focused on repo-wide domain infrastructure. App-specific
  buckets, distributions, APIs, and pipelines stay in each app's infra package.

## Deployment Safety

- Deploy the hosted zone before issuing ACM certificates. Certificate validation
  can block until the registrar delegates nameservers to Route 53.
- Do not remove or replace existing registrar DNS records without explicitly
  confirming the copied Route 53 records with the user.
- Keep certificate issuance opt-in for the first deployment so the nameserver
  handoff can happen in a controlled batch.
