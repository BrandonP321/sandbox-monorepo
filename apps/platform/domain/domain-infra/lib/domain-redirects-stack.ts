import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { redirects, redirectFunctionCode } from "./redirects.js";

/** Independent edge-only stack; never instantiates the domain foundation or CI. */
export class DomainRedirectsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const fn = new cloudfront.CfnFunction(this, "RedirectFunction", {
      name: "sandbox-domain-redirects",
      autoPublish: true,
      functionConfig: {
        comment: "Reviewed temporary domain redirects",
        runtime: "cloudfront-js-2.0"
      },
      functionCode: redirectFunctionCode(redirects)
    });
    const distribution = new cloudfront.CfnDistribution(
      this,
      "RedirectDistribution",
      {
        distributionConfig: {
          enabled: true,
          aliases: Object.keys(redirects),
          comment: "Temporary root-only redirects; no application origin",
          ipv6Enabled: true,
          httpVersion: "http2",
          priceClass: "PriceClass_100",
          viewerCertificate: {
            acmCertificateArn: cdk.Fn.importValue(
              "sandbox-domain-certificate-arn"
            ),
            minimumProtocolVersion: "TLSv1.2_2021",
            sslSupportMethod: "sni-only"
          },
          // CloudFront requires an origin. Every request returns an edge response;
          // this reserved non-resolving domain fails closed if association is lost.
          origins: [
            {
              id: "unreachable",
              domainName: "redirect-origin.invalid",
              customOriginConfig: {
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"]
              }
            }
          ],
          defaultCacheBehavior: {
            targetOriginId: "unreachable",
            // The function handles HTTP with a direct temporary HTTPS redirect,
            // avoiding CloudFront's permanent 301 and intermediate query forwarding.
            viewerProtocolPolicy: "allow-all",
            allowedMethods: ["GET", "HEAD"],
            cachedMethods: ["GET", "HEAD"],
            cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
            functionAssociations: [
              { eventType: "viewer-request", functionArn: fn.attrFunctionArn }
            ]
          }
        }
      }
    );
    for (const [index, host] of Object.keys(redirects).entries()) {
      for (const type of ["A", "AAAA"]) {
        new route53.CfnRecordSet(this, `RedirectAlias${index}${type}`, {
          hostedZoneId: cdk.Fn.importValue("sandbox-domain-hosted-zone-id"),
          name: host,
          type,
          aliasTarget: {
            dnsName: distribution.attrDomainName,
            hostedZoneId: "Z2FDTNDATAQYW2",
            evaluateTargetHealth: false
          }
        });
      }
    }
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.ref });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.attrDomainName
    });
    new cdk.CfnOutput(this, "FunctionName", { value: fn.ref });
  }
}
