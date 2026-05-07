import type {
  AttachedSourceSummary,
  EntrySourceInput
} from "@repo/signal-tracker-shared";

function createSourceUrlRowsFromAttachedSources(
  sources: AttachedSourceSummary[]
): EntrySourceInput[] {
  return sources.flatMap((source) => {
    if (source.relationType !== "source_for") {
      return [];
    }

    const url = source.url ?? source.canonicalUrl;

    return url ? [{ url }] : [];
  });
}

export { createSourceUrlRowsFromAttachedSources };
