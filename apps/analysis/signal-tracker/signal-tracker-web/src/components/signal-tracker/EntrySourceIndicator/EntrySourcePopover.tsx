import { useState } from "react";

import type {
  AttachedSourceSummary,
  EvidenceRecord
} from "@repo/signal-tracker-shared";

import {
  useAttachEntryCitationMutation,
  useDetachEntryCitationMutation
} from "@/api";

import { AddSourceUrlField } from "../AddSourceUrlField";
import { AttachedSourceSummaryList } from "./AttachedSourceSummaryList";

type EntrySourcePopoverProps = {
  entryId: string;
  sources: AttachedSourceSummary[];
};

function EntrySourcePopover({ entryId, sources }: EntrySourcePopoverProps) {
  const [pendingRemoveSourceId, setPendingRemoveSourceId] = useState<
    string | null
  >(null);
  const [
    attachEntryCitation,
    { errorMessage: attachErrorMessage, isLoading: isAttaching }
  ] = useAttachEntryCitationMutation();
  const [detachEntryCitation, { errorMessage: detachErrorMessage }] =
    useDetachEntryCitationMutation();

  async function attachCapturedSource(record: EvidenceRecord) {
    try {
      await attachEntryCitation({
        entryId,
        evidenceItemId: record.evidenceItem.id,
        relationType: "source_for",
        note: undefined
      }).unwrap();
    } catch {
      // The wrapped mutation exposes the display error through errorMessage.
    }
  }

  async function removeSource(source: AttachedSourceSummary) {
    setPendingRemoveSourceId(source.id);

    try {
      await detachEntryCitation({ entryId, citationId: source.id }).unwrap();
    } catch {
      // The wrapped mutation exposes the display error through errorMessage.
    } finally {
      setPendingRemoveSourceId(null);
    }
  }

  return (
    <div className="grid gap-4">
      <section aria-label="Attached sources" className="grid gap-3">
        <div>
          <h4 className="text-sm font-semibold">Sources</h4>
          <p className="text-muted-foreground mt-1 text-xs">
            Sources attached to this timeline entry.
          </p>
        </div>

        <AttachedSourceSummaryList
          onRemoveSource={(source) => void removeSource(source)}
          pendingRemoveSourceId={pendingRemoveSourceId}
          sources={sources}
        />

        {detachErrorMessage ? (
          <p className="text-danger text-xs" role="alert">
            {detachErrorMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <AddSourceUrlField
          className="grid gap-3 border-t-0 pt-0"
          dedupeSources={sources}
          description="Paste a URL to attach it to this entry."
          onRecordCaptured={(record) => void attachCapturedSource(record)}
          title="Add source URL"
        />

        {isAttaching ? (
          <p className="text-muted-foreground text-xs" role="status">
            Attaching source...
          </p>
        ) : null}

        {attachErrorMessage ? (
          <p className="text-danger text-xs" role="alert">
            {attachErrorMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export { EntrySourcePopover, type EntrySourcePopoverProps };
