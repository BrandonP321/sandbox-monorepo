import { useState } from "react";
import { entryDate } from "../dates";
import type { Entry, EntryType, Timeline } from "../model";

export function EntryList({
  entries,
  timelines,
  types,
  onSelect,
  compact = false
}: {
  entries: Entry[];
  timelines: Timeline[];
  types: EntryType[];
  onSelect: (entry: Entry) => void;
  compact?: boolean;
}) {
  const [limit, setLimit] = useState(50);
  return (
    <div className={compact ? "entry-list compact" : "entry-list"}>
      <ol>
        {entries.slice(0, limit).map((entry) => {
          const source = timelines.find(
            (timeline) => timeline.id === entry.sourceId
          );
          const type = types.find((item) => item.id === entry.typeId);
          return (
            <li key={entry.id}>
              <button className="entry-row" onClick={() => onSelect(entry)}>
                <span className="entry-date">{entryDate(entry)}</span>
                <span className="entry-summary">
                  <strong>{entry.title}</strong>
                  <span className="entry-meta">
                    <span className="source-label">
                      <i style={{ background: source?.color }} />
                      {source?.title}
                    </span>
                    <span className="type-label" style={{ color: type?.color }}>
                      {type?.name}
                    </span>
                  </span>
                </span>
                <span aria-hidden="true" className="row-arrow">
                  ↗
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {entries.length > limit && (
        <button className="load-more" onClick={() => setLimit(limit + 50)}>
          Show 50 more · {entries.length - limit} remaining
        </button>
      )}
    </div>
  );
}
