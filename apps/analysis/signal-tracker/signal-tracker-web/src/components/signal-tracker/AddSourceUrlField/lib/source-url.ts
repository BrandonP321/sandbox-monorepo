import { captureEvidenceUrlRequestSchema } from "@repo/signal-tracker-shared";
import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import { getUrlHostname } from "@/lib/url";

const trailingUrlPunctuationPattern = /[),.;:!?]+$/;

type SourceUrlDisplay = {
  canonicalUrl: string | undefined;
  publishedDateLabel: string | undefined;
  sourceDomain: string | undefined;
  sourceLabel: string;
  titleLabel: string;
};
// TODO: Review all code for better implementation method and/or composition opportunities
function getAcceptedSourceUrls(input: string): string[] {
  const candidates = getSourceUrlCandidates(input);
  const acceptedUrls = candidates.flatMap((candidate) => {
    const parsedRequest = captureEvidenceUrlRequestSchema.safeParse({
      url: candidate
    });

    return parsedRequest.success ? [parsedRequest.data.url] : [];
  });

  return Array.from(new Set(acceptedUrls));
}

function getSourceUrlCandidates(input: string): string[] {
  const trimmedInput = input.trim();

  if (trimmedInput.length === 0) {
    return [];
  }

  const matchedUrls = trimmedInput.match(/https?:\/\/[^\s<>"']+/gi) ?? [];

  if (matchedUrls.length > 0) {
    return matchedUrls.map(cleanSourceUrlCandidate);
  }

  return [cleanSourceUrlCandidate(trimmedInput)];
}

function cleanSourceUrlCandidate(candidate: string) {
  return candidate.trim().replace(trailingUrlPunctuationPattern, "");
}

function filterNewSourceUrls(urls: string[], existingUrls: string[]) {
  const existingUrlSet = new Set(existingUrls.map(normalizeSourceUrl));

  return urls.filter((url) => {
    const normalizedUrl = normalizeSourceUrl(url);

    if (existingUrlSet.has(normalizedUrl)) {
      return false;
    }

    existingUrlSet.add(normalizedUrl);
    return true;
  });
}

function normalizeSourceUrl(url: string) {
  try {
    return new URL(url).href;
  } catch {
    return url.trim();
  }
}

function getSourceUrlDisplay(record: EvidenceRecord): SourceUrlDisplay {
  const canonicalUrl = record.evidenceItem.canonicalUrl;
  const domain = getSourceDomain(record);
  const sourceLabel = record.source.canonicalName || domain || "Source";
  const titleLabel = record.evidenceItem.title || canonicalUrl || sourceLabel;

  return {
    canonicalUrl,
    publishedDateLabel: formatPublishedDate(record.evidenceItem.publishedAt),
    sourceDomain: domain,
    sourceLabel,
    titleLabel
  };
}

function getSourceDomain(record: EvidenceRecord) {
  return (
    getUrlHostname(record.source.baseUrl) ??
    getUrlHostname(record.evidenceItem.canonicalUrl)
  );
}

function formatPublishedDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

export {
  filterNewSourceUrls,
  getAcceptedSourceUrls,
  getSourceUrlDisplay,
  normalizeSourceUrl,
  type SourceUrlDisplay
};
