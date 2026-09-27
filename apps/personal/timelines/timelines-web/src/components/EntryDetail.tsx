import { useState } from "react";
import { entryDate } from "../dates";
import {
  resolveSources,
  type Entry,
  type EntryType,
  type Timeline
} from "../model";
import { EntryEditor } from "./EntryEditor";
import { Sheet } from "./Sheet";

export function EntryDetail({
  entry,
  timelines,
  types,
  readOnly,
  isNew,
  onSave,
  onClose
}: {
  entry: Entry;
  timelines: Timeline[];
  types: EntryType[];
  readOnly: boolean;
  isNew: boolean;
  onSave: (entry: Entry) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(isNew);
  const [imageFailed, setImageFailed] = useState(false);
  const source = timelines.find((timeline) => timeline.id === entry.sourceId)!;
  const affected = timelines.filter(
    (timeline) =>
      timeline.id !== source.id &&
      resolveSources(timelines, timeline.id).includes(source.id)
  );
  const type = types.find((item) => item.id === entry.typeId);
  return (
    <Sheet
      title={
        editing ? (isNew ? "Add an entry" : "Edit source entry") : entry.title
      }
      onClose={onClose}
    >
      {!editing ? (
        <>
          <div className="detail-badges">
            <span className="source-label">
              <i style={{ background: source.color }} />
              {source.title}
            </span>
            <span className="type-label" style={{ color: type?.color }}>
              {type?.name}
            </span>
          </div>
          <p className="detail-date">{entryDate(entry)}</p>
          <p className="prose">{entry.description}</p>
          {entry.imageUrl && (
            <figure className="archive-image">
              {imageFailed ? (
                <div role="status">
                  <span aria-hidden="true">▧</span>
                  <strong>Image unavailable</strong>
                  <p>
                    {entry.imageAlt || "The linked image could not be loaded."}
                  </p>
                </div>
              ) : (
                <img
                  src={entry.imageUrl}
                  alt={entry.imageAlt || "Linked archival image"}
                  onError={() => setImageFailed(true)}
                />
              )}
              <figcaption>{entry.imageCaption}</figcaption>
            </figure>
          )}
          <h3>References</h3>
          <p className="reference-text">
            {entry.reference || "No reference added."}
          </p>
          {readOnly ? (
            <p className="notice">
              Read-only view. This entry belongs to {source.title}.
            </p>
          ) : (
            <>
              <div className="notice">
                <strong>A live source entry</strong>
                <p>
                  Editing changes {source.title}
                  {affected.length
                    ? ` and ${affected.length} linked ${affected.length === 1 ? "view" : "views"}: ${affected.map((timeline) => timeline.title).join(", ")}`
                    : ""}
                  .
                </p>
              </div>
              <button className="primary" onClick={() => setEditing(true)}>
                Edit source entry
              </button>
            </>
          )}
        </>
      ) : (
        <EntryEditor
          entry={entry}
          sourceTitle={source.title}
          types={types}
          onSave={onSave}
          onCancel={isNew ? onClose : () => setEditing(false)}
        />
      )}
    </Sheet>
  );
}
