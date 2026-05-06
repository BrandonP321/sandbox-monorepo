import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import { SourceIcon } from "@/components/ui";

type CitationSourceIconProps = {
  record: EvidenceRecord;
};

function CitationSourceIcon({ record }: CitationSourceIconProps) {
  return (
    <SourceIcon
      size="sm"
      url={record.source.baseUrl ?? record.evidenceItem.canonicalUrl}
    />
  );
}

export { CitationSourceIcon, type CitationSourceIconProps };
