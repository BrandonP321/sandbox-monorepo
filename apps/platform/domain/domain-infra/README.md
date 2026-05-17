# Domain Infrastructure

This package owns the repo-wide Route 53 hosted zone and the shared ACM
certificate used by CloudFront and API Gateway custom domains.

## Deployment model

The first deployment creates only the public hosted zone:

```sh
AWS_PROFILE=sandbox-admin pnpm --filter domain-infra exec cdk deploy -c domainName=bphillips.dev -c preserveGoogleWorkspaceRecords=true
```

After the hosted zone exists, copy the `HostedZoneNameServers` output into the
domain registrar as the authoritative nameservers. For a Squarespace-managed
domain, this is the one-time step that lets future app subdomains be managed by
CDK through Route 53.

Once `dig NS example.com` returns the Route 53 nameservers, issue the shared
certificate:

```sh
AWS_PROFILE=sandbox-admin pnpm --filter domain-infra exec cdk deploy -c domainName=bphillips.dev -c preserveGoogleWorkspaceRecords=true -c issueCertificate=true
```

The certificate is created in `us-east-1`, which is required for CloudFront. It
covers the apex domain, `www`, and one-level app subdomains through
`*.example.com`.

## Manual registrar checklist

Before changing nameservers at Squarespace, copy any existing DNS records that
must keep working into the Route 53 hosted zone. Common records to preserve:

- MX records for email
- SPF, DKIM, and DMARC TXT records
- Google, Microsoft, or other site-verification TXT records
- Existing CNAME records for third-party services

Do not issue the certificate before nameserver delegation is live. CloudFormation
waits for DNS validation, so the first hosted-zone deployment intentionally keeps
certificate creation opt-in.

## Current bphillips.dev migration notes

The preserved records are the live Google Workspace records from Squarespace:

- Google MX records for `@`
- SPF TXT for `@`
- Google DKIM TXT for `google._domainkey`
- Google verification CNAME records for `ps7zykca5yn7` and `hvrebfbe5mwa`

The old portfolio website records are intentionally not preserved:

- `@` A record to `198.49.23.144`
- `www` CNAME to `d1jljpaqner2e1.cloudfront.net`
- old ACM validation CNAME beginning with `_7b82c1bd6564f89ec2`

Those records pointed at a retired website/certificate path and would conflict
with the new CDK-managed CloudFront aliases.
