import { readFileSync } from "node:fs";
import { assertSafeChangeSet } from "../lib/wedding-preview-deployment.js";

// Offline only: input is an operator-exported, fully paginated DescribeChangeSet result.
const [path, expectedStackArn, phase] = process.argv.slice(2);
if (!path || !expectedStackArn || (phase !== "api-only" && phase !== "full"))
  throw new Error(
    "Usage: tsx bin/wedding-preview-check-change-set.ts EXPORTED_JSON EXACT_STACK_ARN api-only|full"
  );
const changeSet = JSON.parse(readFileSync(path, "utf8")) as Parameters<
  typeof assertSafeChangeSet
>[0] & { NextToken?: string };
if (changeSet.NextToken) throw new Error("Incomplete change-set export");
assertSafeChangeSet(changeSet, expectedStackArn, phase);
console.log(
  "Resource additions/replacement guard passed; separately compare the complete submitted template and policy hashes before execution."
);
