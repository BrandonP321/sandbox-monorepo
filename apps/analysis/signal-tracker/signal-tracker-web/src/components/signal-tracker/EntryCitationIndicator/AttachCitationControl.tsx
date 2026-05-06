import { useMemo, useState } from "react";

import type { EvidenceRecord } from "@repo/signal-tracker-shared";

import {
  useAttachEntryCitationMutation,
  useListEvidenceItemsQuery
} from "@/api";
import { Button, Select } from "@/components/ui";

import { AddSourceUrlField } from "../AddSourceUrlField";
import { getSourceUrlDisplay } from "../AddSourceUrlField/lib/source-url";

type AttachCitationControlProps = {
  attachedEvidenceItemIds: string[];
  entryId: string;
};
// TODO: Can likely be simplified
function AttachCitationControl({
  attachedEvidenceItemIds,
  entryId
}: AttachCitationControlProps) {
  const attachedEvidenceItemIdSet = useMemo(
    () => new Set(attachedEvidenceItemIds),
    [attachedEvidenceItemIds]
  );
  const [selectedEvidenceItemId, setSelectedEvidenceItemId] = useState("");
  const {
    data,
    errorMessage: listEvidenceErrorMessage,
    isError: isListEvidenceError,
    isLoading: isListEvidenceLoading,
    refetch
  } = useListEvidenceItemsQuery();
  const [
    attachEntryCitation,
    { errorMessage: attachErrorMessage, isLoading: isAttachLoading }
  ] = useAttachEntryCitationMutation();
  const availableEvidence = (data?.evidence ?? []).filter(
    (record) => !attachedEvidenceItemIdSet.has(record.evidenceItem.id)
  );
  const selectedEvidenceRecord = availableEvidence.find(
    (record) => record.evidenceItem.id === selectedEvidenceItemId
  );

  async function attachEvidenceRecord(record: EvidenceRecord) {
    try {
      await attachEntryCitation({
        entryId,
        evidenceItemId: record.evidenceItem.id,
        relationType: "supports",
        note: undefined
      }).unwrap();
      setSelectedEvidenceItemId("");
    } catch {
      // The wrapped mutation exposes the display error through errorMessage.
    }
  }

  function handleCapturedRecord(record: EvidenceRecord) {
    void attachEvidenceRecord(record);
  }

  function handleAttachExistingEvidence() {
    if (!selectedEvidenceRecord) {
      return;
    }

    void attachEvidenceRecord(selectedEvidenceRecord);
  }

  return (
    <section className="grid gap-3">
      <div>
        <h4 className="text-sm font-semibold">Attach source</h4>
        <p className="text-muted-foreground mt-1 text-xs">
          Attach saved evidence or paste a URL for this entry.
        </p>
      </div>

      {isListEvidenceLoading ? (
        <p className="text-muted-foreground text-xs" role="status">
          Loading saved evidence...
        </p>
      ) : null}

      {!isListEvidenceLoading && isListEvidenceError ? (
        <div className="grid gap-2">
          <p className="text-danger text-xs" role="alert">
            {listEvidenceErrorMessage ?? "Saved evidence could not be loaded."}
          </p>
          <Button onClick={refetch} size="sm" variant="outline">
            Retry evidence
          </Button>
        </div>
      ) : null}

      {!isListEvidenceLoading && !isListEvidenceError ? (
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <label className="sr-only" htmlFor={`saved-evidence-${entryId}`}>
              Saved evidence
            </label>
            <Select
              disabled={availableEvidence.length === 0 || isAttachLoading}
              id={`saved-evidence-${entryId}`}
              onChange={(event) =>
                setSelectedEvidenceItemId(event.currentTarget.value)
              }
              options={availableEvidence.map(createEvidenceOption)}
              placeholder={
                availableEvidence.length === 0
                  ? "No saved evidence"
                  : "Choose saved evidence"
              }
              value={selectedEvidenceItemId}
            />
          </div>
          <Button
            disabled={!selectedEvidenceRecord || isAttachLoading}
            isLoading={isAttachLoading}
            loadingLabel="Attaching..."
            onClick={handleAttachExistingEvidence}
            size="sm"
            variant="outline"
          >
            Attach evidence
          </Button>
        </div>
      ) : null}

      {attachErrorMessage ? (
        <p className="text-danger text-xs" role="alert">
          {attachErrorMessage}
        </p>
      ) : null}

      <AddSourceUrlField onRecordCaptured={handleCapturedRecord} />
    </section>
  );
}

function createEvidenceOption(record: EvidenceRecord) {
  const display = getSourceUrlDisplay(record);
  const sourceDetail = display.sourceDomain ?? display.sourceLabel;

  return {
    label: `${display.titleLabel} - ${sourceDetail}`,
    value: record.evidenceItem.id
  };
}

export { AttachCitationControl, type AttachCitationControlProps };
