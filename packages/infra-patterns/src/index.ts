import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export {
  GitHubActionsCodePipelineDeploy,
  type GitHubActionsCodePipelineDeployProps
} from "./github-actions-codepipeline-deploy.js";

export const GITHUB_ACTIONS_OIDC_PROVIDER_URL =
  "https://token.actions.githubusercontent.com";

export const GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME =
  "sandbox-github-actions-oidc-provider-arn";

export function importGitHubActionsOidcProviderArn(): string {
  return cdk.Fn.importValue(GITHUB_ACTIONS_OIDC_PROVIDER_ARN_EXPORT_NAME);
}

export interface DnsAliasRecordProps {
  readonly hostedZone: route53.IHostedZone;
  readonly createRecords?: boolean;
}

export interface ImportedDomainFoundation {
  readonly certificate: acm.ICertificate;
  readonly domainName: string;
  readonly hostedZone: route53.IHostedZone;
}

export interface ImportDomainFoundationProps {
  readonly certificateArnExportName?: string;
  readonly domainName: string;
  readonly hostedZoneIdExportName?: string;
}

export function importDomainFoundation(
  scope: Construct,
  id: string,
  props: ImportDomainFoundationProps
): ImportedDomainFoundation {
  const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
    scope,
    `${id}HostedZone`,
    {
      hostedZoneId: cdk.Fn.importValue(
        props.hostedZoneIdExportName ?? "sandbox-domain-hosted-zone-id"
      ),
      zoneName: props.domainName
    }
  );
  const certificate = acm.Certificate.fromCertificateArn(
    scope,
    `${id}Certificate`,
    cdk.Fn.importValue(
      props.certificateArnExportName ?? "sandbox-domain-certificate-arn"
    )
  );

  return {
    certificate,
    domainName: props.domainName,
    hostedZone
  };
}

export interface HttpLambdaApiCustomDomainProps {
  readonly certificate: acm.ICertificate;
  readonly dns?: DnsAliasRecordProps;
  readonly domainName: string;
}

export interface HttpLambdaApiProps {
  readonly corsPreflight?: apigwv2.CorsPreflightOptions;
  readonly customDomain?: HttpLambdaApiCustomDomainProps;
  readonly defaultStageOptions?: apigwv2.HttpStageOptions;
  readonly disableExecuteApiEndpoint?: boolean;
  readonly handler: lambda.IFunction;
  readonly routes: readonly {
    readonly path: string;
    readonly method: apigwv2.HttpMethod;
  }[];
}

export class HttpLambdaApi extends Construct {
  public readonly apiBaseUrl: string;
  public readonly defaultStage: apigwv2.IHttpStage;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: HttpLambdaApiProps) {
    super(scope, id);

    const createsExplicitDefaultStage = props.defaultStageOptions !== undefined;
    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      corsPreflight: props.corsPreflight ?? {
        allowHeaders: ["content-type", "authorization"],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowOrigins: ["*"]
      },
      createDefaultStage: !createsExplicitDefaultStage,
      disableExecuteApiEndpoint: props.disableExecuteApiEndpoint
    });
    const explicitDefaultStage = createsExplicitDefaultStage
      ? new apigwv2.HttpStage(this, "DefaultStage", {
          ...props.defaultStageOptions,
          httpApi: this.httpApi,
          stageName: "$default",
          autoDeploy: props.defaultStageOptions?.autoDeploy ?? true
        })
      : undefined;
    this.defaultStage = explicitDefaultStage ?? this.httpApi.defaultStage!;

    const integration = new integrations.HttpLambdaIntegration(
      "LambdaIntegration",
      props.handler
    );
    for (const route of props.routes) {
      this.httpApi.addRoutes({
        path: route.path,
        methods: [route.method],
        integration
      });
    }

    if (props.customDomain) {
      const dns = props.customDomain.dns;
      const domainName = new apigwv2.DomainName(this, "DomainName", {
        certificate: props.customDomain.certificate,
        domainName: props.customDomain.domainName
      });
      new apigwv2.ApiMapping(this, "ApiMapping", {
        api: this.httpApi,
        domainName,
        stage: explicitDefaultStage
      });

      this.apiBaseUrl = `https://${props.customDomain.domainName}`;

      if (dns && dns.createRecords !== false) {
        new route53.ARecord(this, "AliasRecord", {
          recordName: resolveRecordName(
            props.customDomain.domainName,
            dns.hostedZone.zoneName
          ),
          target: route53.RecordTarget.fromAlias(
            new targets.ApiGatewayv2DomainProperties(
              domainName.regionalDomainName,
              domainName.regionalHostedZoneId
            )
          ),
          zone: dns.hostedZone
        });
      }
    } else {
      this.apiBaseUrl = this.httpApi.apiEndpoint;
    }
  }
}

export interface SpaSiteCustomDomainProps {
  readonly certificate: acm.ICertificate;
  readonly dns?: DnsAliasRecordProps;
  readonly domainNames: readonly string[];
}

export interface SpaSiteDefaultBehaviorProps {
  readonly functionAssociations?: readonly cloudfront.FunctionAssociation[];
  readonly viewerProtocolPolicy?: cloudfront.ViewerProtocolPolicy;
}

export interface SpaSiteProps {
  readonly customDomain?: SpaSiteCustomDomainProps;
  readonly defaultBehavior?: SpaSiteDefaultBehaviorProps;
}

export class SpaSite extends Construct {
  public readonly distribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;
  public readonly publicUrl: string;

  constructor(scope: Construct, id: string, props: SpaSiteProps = {}) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      certificate: props.customDomain?.certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        functionAssociations: props.defaultBehavior?.functionAssociations
          ? [...props.defaultBehavior.functionAssociations]
          : undefined,
        viewerProtocolPolicy: props.defaultBehavior?.viewerProtocolPolicy
      },
      defaultRootObject: "index.html",
      domainNames: props.customDomain
        ? [...props.customDomain.domainNames]
        : undefined,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html"
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html"
        }
      ]
    });

    this.publicUrl =
      props.customDomain && props.customDomain.domainNames.length > 0
        ? `https://${props.customDomain.domainNames[0]}`
        : `https://${this.distribution.domainName}`;

    const dns = props.customDomain?.dns;

    if (props.customDomain && dns && dns.createRecords !== false) {
      for (const domainName of props.customDomain.domainNames) {
        const recordName = resolveRecordName(
          domainName,
          dns.hostedZone.zoneName
        );
        const recordId = toConstructIdPart(domainName);
        const target = route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(this.distribution)
        );

        new route53.ARecord(this, `AliasRecord${recordId}`, {
          recordName,
          target,
          zone: dns.hostedZone
        });
        new route53.AaaaRecord(this, `Ipv6AliasRecord${recordId}`, {
          recordName,
          target,
          zone: dns.hostedZone
        });
      }
    }
  }
}

function resolveRecordName(
  domainName: string,
  hostedZoneName: string
): string | undefined {
  const normalizedDomainName = domainName.replace(/\.$/, "");
  const normalizedHostedZoneName = hostedZoneName.replace(/\.$/, "");

  if (normalizedDomainName === normalizedHostedZoneName) {
    return undefined;
  }

  const hostedZoneSuffix = `.${normalizedHostedZoneName}`;

  if (normalizedDomainName.endsWith(hostedZoneSuffix)) {
    return normalizedDomainName.slice(0, -hostedZoneSuffix.length);
  }

  return normalizedDomainName;
}

function toConstructIdPart(value: string): string {
  const sanitized = value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");

  return sanitized || "Apex";
}
