import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

type SourceUrlDisplay = {
  canonicalUrl: string | undefined;
  publishedDateLabel: string | undefined;
  sourceDomain: string | undefined;
  sourceLabel: string;
  titleLabel: string;
};

function getAttachedSourceUrlDisplay(
  source: AttachedSourceSummary
): SourceUrlDisplay {
  const canonicalUrl = getAttachedSourceUrl(source);

  return {
    canonicalUrl,
    publishedDateLabel: formatPublishedDate(source.publishedAt),
    sourceDomain: source.sourceDomain,
    sourceLabel: source.sourceName,
    titleLabel: source.title
  };
}

function getAttachedSourceUrl(source: AttachedSourceSummary) {
  return source.url ?? source.canonicalUrl;
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
  getAttachedSourceUrl,
  getAttachedSourceUrlDisplay,
  type SourceUrlDisplay
};
