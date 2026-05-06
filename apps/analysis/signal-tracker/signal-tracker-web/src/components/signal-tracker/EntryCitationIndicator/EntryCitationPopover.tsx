import { X } from "lucide-react";
import { useState } from "react";

import type {
  EntryCitationRecord,
  EntryCitationRelationType
} from "@repo/signal-tracker-shared";

import { useDetachEntryCitationMutation } from "@/api";
import { Button } from "@/components/ui";

import { getSourceUrlDisplay } from "../AddSourceUrlField/lib/source-url";
import { AttachCitationControl } from "./AttachCitationControl";

type EntryCitationPopoverProps = {
  citations: EntryCitationRecord[];
  entryId: string;
  isError: boolean;
  isLoading: boolean;
  listErrorMessage?: string;
  onRetry: () => void;
};
// TODO: Opportunities for reusable UI components
function EntryCitationPopover({
  citations,
  entryId,
  isError,
  isLoading,
  listErrorMessage,
  onRetry
}: EntryCitationPopoverProps) {
  const [pendingDetachCitationId, setPendingDetachCitationId] = useState<
    string | null
  >(null);
  const [detachEntryCitation, { errorMessage: detachErrorMessage }] =
    useDetachEntryCitationMutation();

  async function handleDetachCitation(citationId: string) {
    setPendingDetachCitationId(citationId);

    try {
      await detachEntryCitation({ entryId, citationId }).unwrap();
    } catch {
      // The wrapped mutation exposes the display error through errorMessage.
    } finally {
      setPendingDetachCitationId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <section aria-label="Attached sources" className="grid gap-3">
        <div>
          <h4 className="text-sm font-semibold">Sources</h4>
          <p className="text-muted-foreground mt-1 text-xs">
            Evidence attached to this timeline entry.
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-xs" role="status">
            Loading citations...
          </p>
        ) : null}

        {!isLoading && isError ? (
          <div className="grid gap-2">
            <p className="text-danger text-xs" role="alert">
              {listErrorMessage ?? "Citations could not be loaded."}
            </p>
            <Button onClick={onRetry} size="sm" variant="outline">
              Retry citations
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError && citations.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            No citations attached yet.
          </p>
        ) : null}

        {!isLoading && !isError && citations.length > 0 ? (
          <ul className="grid gap-3">
            {citations.map((record) => (
              <CitationListItem
                isDetaching={pendingDetachCitationId === record.citation.id}
                key={record.citation.id}
                onDetach={() => void handleDetachCitation(record.citation.id)}
                record={record}
              />
            ))}
          </ul>
        ) : null}

        {detachErrorMessage ? (
          <p className="text-danger text-xs" role="alert">
            {detachErrorMessage}
          </p>
        ) : null}
      </section>

      <AttachCitationControl
        attachedEvidenceItemIds={citations.map(
          (record) => record.evidence.evidenceItem.id
        )}
        entryId={entryId}
      />
    </div>
  );
}

function CitationListItem({
  isDetaching,
  onDetach,
  record
}: {
  isDetaching: boolean;
  onDetach: () => void;
  record: EntryCitationRecord;
}) {
  const display = getSourceUrlDisplay(record.evidence);
  const sourceDetail = display.sourceDomain ?? display.sourceLabel;
  const detachLabel = `Detach source ${display.sourceLabel}`;

  return (
    <li className="border-border grid gap-2 rounded-md border p-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <p className="text-sm font-medium">{display.titleLabel}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {display.sourceLabel}
            {sourceDetail !== display.sourceLabel ? ` / ${sourceDetail}` : ""}
          </p>
        </div>
        <Button
          aria-label={detachLabel}
          disabled={isDetaching}
          iconLeft={<X aria-hidden="true" className="size-3.5" />}
          onClick={onDetach}
          size="sm"
          variant="ghost"
        >
          {isDetaching ? "Detaching..." : "Detach"}
        </Button>
      </div>

      <dl className="grid gap-1 text-xs">
        {display.canonicalUrl ? (
          <div className="min-w-0">
            <dt className="text-muted-foreground inline">URL: </dt>
            <dd className="inline break-all">{display.canonicalUrl}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted-foreground inline">Relation: </dt>
          <dd className="inline">
            {formatRelationType(record.citation.relationType)}
          </dd>
        </div>
        {record.citation.note ? (
          <div>
            <dt className="text-muted-foreground inline">Note: </dt>
            <dd className="inline">{record.citation.note}</dd>
          </div>
        ) : null}
        {record.anchor?.quoteText ? (
          <div>
            <dt className="text-muted-foreground inline">Quote: </dt>
            <dd className="inline">{record.anchor.quoteText}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}

function formatRelationType(relationType: EntryCitationRelationType) {
  const relationLabels = {
    contradicts: "Contradicts",
    contextualizes: "Contextualizes",
    source_for: "Source for",
    supports: "Supports"
  } satisfies Record<EntryCitationRelationType, string>;

  return relationLabels[relationType];
}

export { EntryCitationPopover, type EntryCitationPopoverProps };
