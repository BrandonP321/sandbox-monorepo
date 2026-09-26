// USD list prices, us-east-1 / North American CDN, verified 2026-09-25.
// No free tiers or credits subtracted. Sources and units are in ../costs.md.
export type Usage = {
  api: number;
  seconds: number;
  cdnRequests: number;
  cdnGB: number;
  apiGB: number;
  readUnits: number;
  writeUnits: number;
  tableGB: number;
  backupGB: number;
  s3GB: number;
  puts: number;
  gets: number;
  logGB: number;
  logStoredGB: number;
  buildMinutes: number;
  actionMinutes: number;
  secrets: number;
  secretCalls: number;
};
export const baseline: Usage = {
  api: 20_000,
  seconds: 0.25,
  cdnRequests: 50_000,
  cdnGB: 2,
  apiGB: 1,
  readUnits: 2_000_000,
  writeUnits: 200_000,
  tableGB: 0.5,
  backupGB: 1,
  s3GB: 1,
  puts: 5_000,
  gets: 10_000,
  logGB: 0.1,
  logStoredGB: 0.1,
  buildMinutes: 100,
  actionMinutes: 100,
  secrets: 1,
  secretCalls: 1_000
};
export const testEnvironment: Usage = {
  api: 5_000,
  seconds: 0.25,
  cdnRequests: 10_000,
  cdnGB: 0.2,
  apiGB: 0.1,
  readUnits: 500_000,
  writeUnits: 50_000,
  tableGB: 0.05,
  backupGB: 0.1,
  s3GB: 0.5,
  puts: 2_000,
  gets: 2_000,
  logGB: 0.05,
  logStoredGB: 0.05,
  buildMinutes: 50,
  actionMinutes: 50,
  secrets: 1,
  secretCalls: 1_000
};
export const elevated: Usage = {
  ...baseline,
  api: 1_000_000,
  seconds: 0.4,
  cdnRequests: 2_000_000,
  cdnGB: 50,
  apiGB: 50,
  readUnits: 60_000_000,
  writeUnits: 1_500_000,
  tableGB: 2,
  backupGB: 4,
  logGB: 2,
  logStoredGB: 2,
  gets: 100_000
};
export function costs(u: Usage) {
  const items = {
    hosting:
      u.s3GB * 0.023 + (u.puts * 0.005) / 1000 + (u.gets * 0.0004) / 1000,
    cdn: u.cdnGB * 0.085 + (u.cdnRequests * 0.01) / 10_000,
    api: u.api / 1e6 + u.apiGB * 0.09,
    lambda: u.api * (0.2 / 1e6 + 0.5 * u.seconds * 0.0000166667),
    database:
      (u.readUnits * 0.125) / 1e6 +
      (u.writeUnits * 0.625) / 1e6 +
      u.tableGB * 0.25,
    backups: u.tableGB * 0.2 + u.backupGB * 0.1,
    identity: 0.0055,
    secrets: u.secrets * 0.4 + (u.secretCalls * 0.05) / 10_000,
    logs: u.logGB * 0.5 + u.logStoredGB * 0.03,
    alarms: 6 * 0.1,
    delivery: u.buildMinutes * 0.005 + u.actionMinutes * 0.002,
    // Allowance for DNS queries, notifications and small control-plane requests.
    operationsAllowance: 0.1
  };
  return {
    ...items,
    total: Object.values(items).reduce((sum, value) => sum + value, 0)
  };
}
if (import.meta.main) {
  console.log(
    JSON.stringify(
      {
        baseline: costs(baseline),
        test: costs(testEnvironment),
        elevated: costs(elevated)
      },
      null,
      2
    )
  );
}
