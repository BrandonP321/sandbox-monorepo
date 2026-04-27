import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export const SIGNAL_TRACKER_DATABASE_NAME = "signal_tracker";

export type SignalTrackerDatabaseCapacityMode = "default" | "recruiting";

export interface SignalTrackerDatabaseProps {
  readonly capacityMode: SignalTrackerDatabaseCapacityMode;
}

type CapacitySettings = {
  readonly minCapacity: number;
  readonly maxCapacity: number;
  readonly autoPauseDuration?: cdk.Duration;
};

export class SignalTrackerDatabase extends Construct {
  public readonly cluster: rds.DatabaseCluster;
  public readonly capacityMode: SignalTrackerDatabaseCapacityMode;
  public readonly databaseName = SIGNAL_TRACKER_DATABASE_NAME;
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: SignalTrackerDatabaseProps) {
    super(scope, id);

    this.capacityMode = props.capacityMode;
    const capacity = getCapacitySettings(props.capacityMode);

    this.vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "DatabaseIsolated",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        }
      ]
    });

    this.cluster = new rds.DatabaseCluster(this, "Cluster", {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_16_10
      }),
      credentials: rds.Credentials.fromGeneratedSecret("signal_tracker_admin"),
      defaultDatabaseName: this.databaseName,
      writer: rds.ClusterInstance.serverlessV2("Writer", {
        publiclyAccessible: false
      }),
      readers: [],
      vpc: this.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      enableDataApi: true,
      storageEncrypted: true,
      backup: { retention: cdk.Duration.days(7) },
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      serverlessV2MinCapacity: capacity.minCapacity,
      serverlessV2MaxCapacity: capacity.maxCapacity,
      serverlessV2AutoPauseDuration: capacity.autoPauseDuration
    });
  }
}

export function resolveSignalTrackerDatabaseCapacityMode(
  app: cdk.App
): SignalTrackerDatabaseCapacityMode {
  const contextValue = app.node.tryGetContext("dbCapacityMode") as
    | string
    | undefined;

  if (!contextValue || contextValue === "default") {
    return "default";
  }

  if (contextValue === "recruiting") {
    return "recruiting";
  }

  throw new Error(
    `Unsupported dbCapacityMode "${contextValue}". Use "default" or "recruiting".`
  );
}

function getCapacitySettings(
  mode: SignalTrackerDatabaseCapacityMode
): CapacitySettings {
  if (mode === "recruiting") {
    return {
      minCapacity: 0.5,
      maxCapacity: 2
    };
  }

  return {
    minCapacity: 0,
    maxCapacity: 2,
    autoPauseDuration: cdk.Duration.minutes(10)
  };
}
