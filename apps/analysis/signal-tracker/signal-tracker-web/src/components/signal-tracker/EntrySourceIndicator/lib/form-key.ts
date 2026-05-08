import type { AttachedSourceSummary } from "@repo/signal-tracker-shared";

import { createSourceUrlRowsFromAttachedSources } from "@/components/signal-tracker/SourceUrlEditor/lib/source-url-rows";

function getEntrySourceManagerFormKey(
  entryId: string,
  sources: AttachedSourceSummary[]
) {
  return [
    entryId,
    ...createSourceUrlRowsFromAttachedSources(sources).map(
      (source) => source.url
    )
  ].join("|");
}

export { getEntrySourceManagerFormKey };
