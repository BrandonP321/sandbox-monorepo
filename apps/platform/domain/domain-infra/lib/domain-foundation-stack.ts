import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";

export interface DomainFoundationStackProps extends cdk.StackProps {
  readonly domainName: string;
  readonly issueCertificate?: boolean;
  readonly preserveGoogleWorkspaceRecords?: boolean;
}

export class DomainFoundationStack extends cdk.Stack {
  public readonly certificate?: acm.Certificate;
  public readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: DomainFoundationStackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, "HostedZone", {
      zoneName: props.domainName
    });

    new cdk.CfnOutput(this, "HostedZoneId", {
      exportName: "sandbox-domain-hosted-zone-id",
      value: this.hostedZone.hostedZoneId
    });
    new cdk.CfnOutput(this, "HostedZoneName", {
      exportName: "sandbox-domain-hosted-zone-name",
      value: this.hostedZone.zoneName
    });
    new cdk.CfnOutput(this, "HostedZoneNameServers", {
      value: cdk.Fn.join(",", this.hostedZone.hostedZoneNameServers ?? [])
    });

    if (props.preserveGoogleWorkspaceRecords) {
      addGoogleWorkspaceRecords(this, this.hostedZone, props.domainName);
    }

    if (props.issueCertificate) {
      this.certificate = new acm.Certificate(this, "Certificate", {
        domainName: props.domainName,
        subjectAlternativeNames: [
          `*.${props.domainName}`,
          `www.${props.domainName}`
        ],
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
      });

      new cdk.CfnOutput(this, "CertificateArn", {
        exportName: "sandbox-domain-certificate-arn",
        value: this.certificate.certificateArn
      });
    }
  }
}

function addGoogleWorkspaceRecords(
  scope: Construct,
  hostedZone: route53.IHostedZone,
  domainName: string
) {
  new route53.MxRecord(scope, "GoogleWorkspaceMxRecord", {
    ttl: cdk.Duration.hours(4),
    values: [
      { hostName: "aspmx.l.google.com", priority: 1 },
      { hostName: "alt1.aspmx.l.google.com", priority: 5 },
      { hostName: "alt2.aspmx.l.google.com", priority: 5 },
      { hostName: "alt3.aspmx.l.google.com", priority: 10 },
      { hostName: "alt4.aspmx.l.google.com", priority: 10 }
    ],
    zone: hostedZone
  });

  addTxtRecord(scope, "GoogleWorkspaceSpfRecord", {
    domainName,
    hostedZone,
    name: domainName,
    values: ["v=spf1 include:_spf.google.com ~all"]
  });

  addTxtRecord(scope, "GoogleWorkspaceDkimRecord", {
    domainName,
    hostedZone,
    name: `google._domainkey.${domainName}`,
    values: [
      "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhuHw1NFfYSzJviJv/WBpGORUTUn+h0mLuJvPfbN0bYPQ9uNhoHleERf3gFoPumuchRCNU/hPQvHxFF1JLkQI7rHv0jnI/rThLZi5IjJ9oX0nbDkveZW1c3hXSHQ5eI0nFB6KAicTUyp",
      "90Aaf04ahOV23H3/ceSGMtB0iuDMLsSgqZ/m2Z4eLI2P4N+NB1d0W0+tUeMVXGO3OvV0MxxzOuQ0EzOCegcls5BIUxfT+rWqyqEuv/LEa0iarD6A2dQsni5mGgrAaexLIKEJTfoo32jg0gsuaV/AvVvcTqgNlgTxFCZCQnJTbpUGCuhu9yCus7/uOVqKUEWhjEzHEl4Pq",
      "OQIDAQAB"
    ]
  });

  new route53.CnameRecord(scope, "GoogleVerificationPrimaryRecord", {
    domainName: "gv-oeaaomwz3imyse.dv.googlehosted.com",
    recordName: "ps7zykca5yn7",
    ttl: cdk.Duration.hours(4),
    zone: hostedZone
  });

  new route53.CnameRecord(scope, "GoogleVerificationSecondaryRecord", {
    domainName: "gv-p3vgf22k5uerzd.dv.googlehosted.com",
    recordName: "hvrebfbe5mwa",
    ttl: cdk.Duration.hours(4),
    zone: hostedZone
  });
}

function addTxtRecord(
  scope: Construct,
  id: string,
  props: {
    readonly domainName: string;
    readonly hostedZone: route53.IHostedZone;
    readonly name: string;
    readonly values: readonly string[];
  }
) {
  new route53.CfnRecordSet(scope, id, {
    hostedZoneId: props.hostedZone.hostedZoneId,
    name: `${props.name}.`,
    resourceRecords: [props.values.map((value) => `"${value}"`).join(" ")],
    ttl: "14400",
    type: "TXT"
  });
}
