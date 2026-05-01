import {
  type CaptureEvidenceUrlRequest,
  type CreateEvidenceItemRequest,
  type EvidenceRecord
} from "@repo/signal-tracker-shared";

import { createEvidenceItemRecord } from "./create-evidence-item";
import type { EvidenceRepository } from "./evidence-repository";

const TRACKING_PARAMETER_NAMES = new Set([
  "fbclid",
  "gclid",
  "gbraid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "wbraid"
]);

type CaptureEvidenceUrlDependencies = {
  repository: Pick<EvidenceRepository, "create">;
  generateId?: () => string;
  now?: () => Date;
};

export async function captureEvidenceUrlRecord(
  input: CaptureEvidenceUrlRequest,
  dependencies: CaptureEvidenceUrlDependencies
): Promise<EvidenceRecord> {
  return createEvidenceItemRecord(buildEvidenceItemRequest(input), {
    repository: dependencies.repository,
    generateId: dependencies.generateId,
    now: dependencies.now
  });
}

export function buildEvidenceItemRequest(
  input: CaptureEvidenceUrlRequest
): CreateEvidenceItemRequest {
  const canonicalUrl = canonicalizeEvidenceUrl(input.url);
  const canonicalUrlObject = new URL(canonicalUrl);
  const sourceName = input.source?.canonicalName ?? canonicalUrlObject.hostname;

  return {
    source: {
      canonicalName: sourceName,
      baseUrl: canonicalUrlObject.origin,
      sourceType: input.source?.sourceType ?? "other",
      ...(input.source?.notes ? { notes: input.source.notes } : {})
    },
    canonicalUrl,
    title: input.title ?? deriveTitleFromUrl(canonicalUrlObject),
    ...(input.author ? { author: input.author } : {}),
    ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
    ...(input.contentType ? { contentType: input.contentType } : {}),
    ...(input.language ? { language: input.language } : {}),
    metadata: {
      ...(input.metadata ?? {}),
      originalUrl: input.url,
      captureMethod: "url_paste"
    }
  };
}

export function canonicalizeEvidenceUrl(input: string): string {
  const url = new URL(input.trim());
  const protocol = url.protocol.toLowerCase();

  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error("Evidence URL must use http or https");
  }

  url.protocol = protocol;
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  if (
    (url.protocol === "http:" && url.port === "80") ||
    (url.protocol === "https:" && url.port === "443")
  ) {
    url.port = "";
  }

  url.search = formatCanonicalSearchParams(url.searchParams);

  return url.toString();
}

function formatCanonicalSearchParams(searchParams: URLSearchParams): string {
  const sortedParams = Array.from(searchParams.entries())
    .filter(([name]) => !isTrackingParameterName(name))
    .sort(([leftName, leftValue], [rightName, rightValue]) => {
      const nameComparison = leftName.localeCompare(rightName);

      return nameComparison === 0
        ? leftValue.localeCompare(rightValue)
        : nameComparison;
    });

  const formattedParams = new URLSearchParams(sortedParams).toString();

  return formattedParams ? `?${formattedParams}` : "";
}

function isTrackingParameterName(name: string): boolean {
  const normalizedName = name.toLowerCase();

  return (
    normalizedName.startsWith("utm_") ||
    TRACKING_PARAMETER_NAMES.has(normalizedName)
  );
}

function deriveTitleFromUrl(url: URL): string {
  const lastSegment = url.pathname
    .split("/")
    .filter((segment) => segment.length > 0)
    .at(-1);

  if (!lastSegment) {
    return url.hostname;
  }

  try {
    return decodeURIComponent(lastSegment).replace(/[-_]+/g, " ");
  } catch {
    return lastSegment.replace(/[-_]+/g, " ");
  }
}
