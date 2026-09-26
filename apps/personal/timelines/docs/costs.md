# Timelines monthly cost model

Estimate as of **2026-09-25**, USD, **us-east-1**, 730 hours/month for continuous
compute comparisons. CloudFront viewers use North American rates (Price Class 100;
European viewer mix needs its corresponding rate). On-demand list prices, no
introductory credits, recurring free tiers, shared-account allowances, Savings
Plans or taxes deducted. Existing domain and assistant subscriptions are sunk
costs; no domain purchase or model inference is planned. New isolated test resources
are included even when idle. This is a planning estimate, not a measured invoice.

## Inputs and official prices

| Service / unit                                                      | Rate used                                           | Official source                                                                                                                                                                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DynamoDB Standard read / write units                                | $0.125 / $0.625 per million                         | [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/)                                                                                                                                                                        |
| Table storage, including materialized lookups and **all revisions** | $0.25/GB-month                                      | [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/)                                                                                                                                                                        |
| PITR / on-demand backups / restore                                  | $0.20 / $0.10 / $0.15 per GB                        | [DynamoDB backup examples](https://aws.amazon.com/dynamodb/pricing/)                                                                                                                                                                |
| S3 Standard / PUT-LIST / GET                                        | $0.023/GB-month; $0.005/1,000; $0.0004/1,000        | [S3 pricing](https://aws.amazon.com/s3/pricing/) and [regional price list](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json), version `20260918174747` retrieved for these exact rates |
| CloudFront HTTPS / data out                                         | $0.01/10,000; $0.085/GB                             | [CloudFront pay-as-you-go](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/)                                                                                                                                                |
| HTTP API / direct API data out                                      | $1/million billable requests; $0.09/GB              | [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/)                                                                                                                                                                  |
| Lambda x86 requests / compute                                       | $0.20/million; $0.0000166667/GB-second              | [Lambda pricing](https://aws.amazon.com/lambda/pricing/)                                                                                                                                                                            |
| Cognito Lite local MAU                                              | $0.0055; model charges even the first MAU           | [Cognito pricing](https://aws.amazon.com/cognito/pricing/)                                                                                                                                                                          |
| Secrets Manager secret / reads                                      | $0.40/month; $0.05/10,000                           | [Secrets Manager pricing](https://aws.amazon.com/secrets-manager/pricing/)                                                                                                                                                          |
| CloudWatch ingestion / retained logs / standard metric alarm        | $0.50/GB; $0.03/GB-month; $0.10/alarm-month         | [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/)                                                                                                                                                                    |
| CodeBuild EC2 Linux small / CodePipeline V2                         | $0.005/build minute; $0.002/action execution minute | [CodeBuild](https://aws.amazon.com/codebuild/pricing/), [CodePipeline](https://aws.amazon.com/codepipeline/pricing/)                                                                                                                |

GB represents billable storage/transfer units; the workload estimates round up and
do not rely on compression. API usage below assumes each call fits one 512 KiB
metering unit; larger import/export calls must multiply request units. AWS-origin
transfer to CloudFront is not double-charged; dynamic API responses are direct
and counted separately. No GSI, Streams, KMS customer key, WAF, SMS, paid identity
add-on, custom metrics, dashboard subscription or NAT is included because none is
selected. Six alarms/environment use built-in service metrics. The cursor signing
secret is one secret/environment; no database password. Any confidential ChatGPT
OAuth client secret is held by that connection, not fetched per tool call.

## Workload and arithmetic

The executable model is [proof/cost.mts](proof/cost.mts); the regression test checks
the baseline sum, both-environment budget and marginal storage cost.

| Monthly input                                    | Personal production | Isolated test | Elevated production |
| ------------------------------------------------ | ------------------: | ------------: | ------------------: |
| API calls / Lambda mean duration at 512 MiB      |      20,000 / 250ms | 5,000 / 250ms |   1,000,000 / 400ms |
| Static HTTPS requests / CDN GB                   |          50,000 / 2 |  10,000 / 0.2 |      2,000,000 / 50 |
| Direct API response GB                           |                   1 |           0.1 |                  50 |
| Strong/transaction-adjusted read units           |           2,000,000 |       500,000 |          60,000,000 |
| Transaction-adjusted write units                 |             200,000 |        50,000 |           1,500,000 |
| Table GB, including history                      |                 0.5 |          0.05 |                   2 |
| Retained on-demand backup GB (two copies)        |                   1 |           0.1 |                   4 |
| S3 assets, pipeline artifacts, temporary work GB |                   1 |           0.5 |                   1 |
| S3 PUT-LIST / GET                                |      5,000 / 10,000 | 2,000 / 2,000 |     5,000 / 100,000 |
| Logs ingested and retained GB                    |            0.1 each |     0.05 each |              2 each |
| Build / action minutes                           |           100 / 100 |       50 / 50 |           100 / 100 |
| MAU / secrets / secret reads                     |       1 / 1 / 1,000 | 1 / 1 / 1,000 |       1 / 1 / 1,000 |

Personal load means roughly 1,000 shared visits/month, plus owner browsing and
~1,000 entity revisions/month, often grouped into batches. API calls include
authorization checks, polling, previews and retry headroom. Elevated sharing is
roughly 50,000 visits/month with 20 API calls per visit. No viewer identity charge.
At 10,000 entries averaging 4 KiB and ~100,000 retained 4 KiB revisions, 0.5 GB
allows current data plus metadata, graph and compact audit/receipt overhead.
Actual bigger records must increase this input; 100,000 max-size revisions alone
would consume ~2 GB.

Read allowance includes strong owner/grant checks and detail reads. A cold metadata
load of 10,000 average 1 KiB rows costs about 2,500 RRUs (maximum 2 KiB rows: 5,000).
500 cold loads/month = 1.25M RRUs, leaving 0.75M for remaining operations. Elevated
model allows roughly 20,000 such loads (50M RRUs) plus 10M for authorization,
details and retries; instrument this assumption. Its 1.5M WRUs include up to 1M
per-share limiter counter writes plus content/proposal overhead. Cache hits still pay authorization reads.
Owner writes invalidate content caches; cache locality is not guaranteed by Lambda.
Transactional reads cost twice ordinary strong reads; transactions write twice per
1 KiB increment. An average 4 KiB current + 4 KiB revision + lookup rows consumes
~20–30 WRUs before shared transaction overhead. The 200k WRU baseline includes
materialized indexes, proposals, receipts, throttling counters and retries, not
just logical entry writes. Bootstrap 10k entries is a one-time burst to model
separately (~0.16–$0.30 writes at these averages).

| Monthly USD                                | Personal production | Isolated test | Elevated production |
| ------------------------------------------ | ------------------: | ------------: | ------------------: |
| S3 storage/requests                        |              0.0520 |        0.0223 |              0.0880 |
| CloudFront requests/egress                 |              0.2200 |        0.0270 |              6.2500 |
| HTTP API/egress                            |              0.1100 |        0.0140 |              5.5000 |
| Lambda                                     |              0.0457 |        0.0114 |              3.5333 |
| DynamoDB requests/storage                  |              0.5000 |        0.1063 |              8.9375 |
| PITR + two backups                         |              0.2000 |        0.0200 |              0.8000 |
| Identity                                   |              0.0055 |        0.0055 |              0.0055 |
| Secret/storage and reads                   |              0.4050 |        0.4050 |              0.4050 |
| Logs                                       |              0.0530 |        0.0265 |              1.0600 |
| Six alarms                                 |              0.6000 |        0.6000 |              0.6000 |
| Build/deploy                               |              0.7000 |        0.3500 |              0.7000 |
| DNS/notification/control-request allowance |              0.1000 |        0.1000 |              0.1000 |
| **Total**                                  |          **2.9912** |    **1.6880** |         **27.9793** |

**Personal + test: $4.68/month**. A 50% planning reserve gives **$7.02**.
**Elevated + test: $29.67**, exceeding the target; inspect traffic/cache assumptions
and adjust rate limits or budget explicitly. Existing shared Route53 zone and ACM
certificate add no new fixed charge; buying a new domain/zone would be additional.
Build inputs represent 10 production and 5 test runs of 10 minutes total
validation/deploy work. Source actions are not charged by V2. GitHub starts the
existing public-repo pipeline through OIDC; no paid Actions runner is selected.
Pipeline artifact storage and logs are included. Changes to runner size, frequency,
CI visibility or pipeline action layout require re-estimation.

## Sensitivity, retention and alternatives

- One additional GB of indefinitely retained table/history adds **$0.65/month**
  including PITR and two backup copies: 0.25 + 0.20 + 2 x 0.10. An additional
  1,000 average 4 KiB revisions/month grows storage by ~0.004 GB/month before
  envelopes/indexes (~0.048 GB/year); 1,000 maximum-size 20 KiB revisions/month
  is ~0.24 GB/year. No automatic content/revision expiry hides this growth.
- Additional 100 GB static egress is $8.50; direct API egress $9.00. Add requests
  separately. Viewer geography matters. External images are not hosted/proxied.
- Another 1M API calls at 512 MiB/250ms costs ~$3.28 in API/Lambda alone, plus
  egress, logs and data reads. An uncached 10k-row load on every one of 1M calls
  costs **$312.50** in metadata reads alone (twice at maximum row size). No design
  can claim the baseline budget for that workload; measure cache misses and cap work.
- Another 1,000 build minutes + matching V2 minutes adds $7.00. A table restore
  adds $0.15/GB once, plus restored table storage; a 0.5 GB quarterly restore drill
  averages $0.025/month before brief test storage, covered by the allowance.
- Retaining twelve rather than two monthly 0.5 GB backups adds $0.50/month.
  Backups expire under the stated policy; revision history does not. An idle test
  environment still has storage, secret and alarm costs; destroying it requires
  explicit approval. Local disposable fixtures cost no AWS service usage.

PostgreSQL range indexes/recursive queries and foreign keys are materially simpler
for complex queries. Using Aurora Standard in this region costs $0.12/ACU-hour,
$0.10/GB-month storage and $0.20/million I/Os; Data API adds $0.35/million first-tier
requests (metered payload increments also matter).
[Aurora prices](https://aws.amazon.com/rds/aurora/pricing/).
AWS documents typical resume around 15 seconds, possibly longer after a day paused;
this is a published expectation, **not measured in this proof**.
[Aurora pause/resume](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2-auto-pause.html).

| Aurora compute scenario, per environment                   |                             Compute/month |
| ---------------------------------------------------------- | ----------------------------------------: |
| 0.5 ACU continuously, 730h                                 |                                    $43.80 |
| 0.5 ACU for 1h/day + six 10-minute idle tails/day, 30 days |                                     $3.60 |
| 0.5 ACU for 8h/day, 30 days                                |                                    $14.40 |
| Fully paused                                               | $0 compute; storage/backups/secret remain |

At a planning 10 GB cluster storage, add $1/month, ~$0.40 database credential
secret, $0.20 per 1M I/Os and ~$0.035 per 100k small Data API calls, plus backup
storage beyond the included allowance. Two continuously warm 0.5-ACU environments
start at **$87.60 compute alone**. Infrequent personal access can fit when paused,
but scattered public requests may prevent pause and resume misses the initial-view
target. Hence DynamoDB remains selected. No paid alternative was provisioned.

The architecture record defines alerts, rate limits, cache checks and the shutdown/
revocation procedure. Refresh prices and replace workload assumptions with measured
Lambda duration, consumed capacity, bytes and cache misses in #113/#114.
