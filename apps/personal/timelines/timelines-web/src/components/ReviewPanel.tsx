import { useState } from "react";
import { entryDate } from "../dates";
import { revisionConflicts, type Entry, type Revision } from "../model";
import { Sheet } from "./Sheet";

export function ReviewPanel({
  entries,
  proposalEntries,
  revisions,
  message,
  onApply,
  onUndo,
  onClose
}: {
  entries: Entry[];
  proposalEntries: Entry[];
  revisions: Revision[];
  message: string;
  onApply: (name: string, next: Entry[]) => void;
  onUndo: (revision: Revision) => void;
  onClose: () => void;
}) {
  const [proposal] = useState(() =>
    proposalEntries.slice(0, 2).map((entry) => ({
      before: entry,
      after: {
        ...entry,
        description: `${entry.description}\n\nReview note: confirm this account against a primary source.`
      }
    }))
  );
  const [applied, setApplied] = useState(false);
  const stale = proposal.some(
    ({ before }) =>
      JSON.stringify(entries.find((entry) => entry.id === before.id)) !==
      JSON.stringify(before)
  );
  return (
    <Sheet title="Review & revisions" onClose={onClose} wide>
      <span className="eyebrow">EXAMPLE BATCH / {proposal.length} CHANGES</span>
      <h3>Add research reminders</h3>
      <p className="prose">
        An exact preview of a synthetic editing proposal. Nothing changes until
        you apply this batch.
      </p>
      {proposal.length === 0 && (
        <p className="notice">Add an entry to try a batch preview.</p>
      )}
      {proposal.map(({ before, after }) => (
        <article className="change-preview" key={before.id}>
          <h4>{before.title}</h4>
          <small>{entryDate(before)} · description only</small>
          <div className="diff-grid">
            <div>
              <span>BEFORE</span>
              <p>{before.description}</p>
            </div>
            <div>
              <span>AFTER</span>
              <p>{after.description}</p>
            </div>
          </div>
        </article>
      ))}
      <button
        className="primary"
        disabled={applied || stale || !proposal.length}
        onClick={() => {
          onApply(
            "Research reminders",
            proposal.map(({ after }) => after)
          );
          setApplied(true);
        }}
      >
        {applied ? "Batch applied" : "Apply this exact batch"}
      </button>
      {stale && !applied && (
        <p role="alert">
          The entries changed. Reopen review to get a fresh preview.
        </p>
      )}
      <div className="revision-heading">
        <h3>Session history</h3>
        <span>{revisions.length} revisions</span>
      </div>
      <p className="field-hint">
        Changes and recovery history reset when this page reloads.
      </p>
      {!revisions.length && (
        <p>No edits yet. Saved entries and batches will appear here.</p>
      )}
      {revisions.map((revision) => (
        <article className="revision-row" key={revision.id}>
          <div>
            <strong>{revision.name}</strong>
            <small>
              {revision.after.length}{" "}
              {revision.after.length === 1 ? "entry" : "entries"} ·{" "}
              {revision.undone
                ? "Restored"
                : revisionConflicts(entries, revision)
                  ? "Newer changes conflict"
                  : "Can restore"}
            </small>
          </div>
          <button
            disabled={revision.undone || revisionConflicts(entries, revision)}
            onClick={() => onUndo(revision)}
          >
            {revision.after.length === 1 ? "Restore revision" : "Undo batch"}
          </button>
        </article>
      ))}
      <p role="status" className="field-hint">
        {message}
      </p>
    </Sheet>
  );
}
