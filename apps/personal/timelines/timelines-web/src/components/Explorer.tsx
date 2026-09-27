import { useState } from "react";
import { datePosition, fitEntries, overlaps, zoomViewport } from "../dates";
import type { Entry, EntryType, Timeline, Viewport } from "../model";
import { EntryList } from "./EntryList";
import { TimelineCanvas } from "./TimelineCanvas";
import { TimelineToolbar } from "./TimelineToolbar";

type Props = {
  scoped: Entry[];
  sources: Timeline[];
  visibleTypes: EntryType[];
  timelineId: string;
  readOnly: boolean;
  demoState: string;
  setDemoState: (state: string) => void;
  onManageSources: () => void;
  onAdd: () => void;
  onSelect: (entry: Entry) => void;
  onGroup: (entries: Entry[]) => void;
};
export function Explorer({
  scoped,
  sources,
  visibleTypes,
  timelineId,
  readOnly,
  demoState,
  setDemoState,
  onManageSources,
  onAdd,
  onSelect,
  onGroup
}: Props) {
  const [viewport, setViewport] = useState<Viewport>(() =>
    timelineId === "america" ? { start: 1755, end: 1895 } : fitEntries(scoped)
  );
  const [mode, setMode] = useState<"timeline" | "list">(() =>
    window.matchMedia("(max-width: 760px)").matches ? "list" : "timeline"
  );
  const [query, setQuery] = useState("");
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);
  const filtered = scoped
    .filter(
      (entry) =>
        !hiddenTypes.includes(entry.typeId) &&
        `${entry.title} ${entry.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
    )
    .sort(
      (left, right) =>
        datePosition(left.start) - datePosition(right.start) ||
        left.title.localeCompare(right.title)
    );
  const visible = filtered.filter((entry) => overlaps(entry, viewport));
  const lanes = sources.filter((source) =>
    scoped.some((entry) => entry.sourceId === source.id)
  );
  const pan = (fraction: number) => {
    setViewport((current) => {
      const offset = (current.end - current.start) * fraction;
      return { start: current.start + offset, end: current.end + offset };
    });
  };
  return (
    <section className="explorer" aria-label="Timeline explorer">
      <div className="filter-bar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search entries</span>
          <input
            type="search"
            placeholder="Find an event, idea, or connection…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd aria-hidden="true">search</kbd>
        </label>
        {!readOnly && (
          <button className="sources-button" onClick={() => onManageSources()}>
            ▤ <span>Manage sources</span>
          </button>
        )}
      </div>
      <div className="type-filters" aria-label="Filter by entry type">
        <span className="eyebrow">SHOW</span>
        {visibleTypes.map((type) => (
          <button
            key={type.id}
            aria-pressed={!hiddenTypes.includes(type.id)}
            onClick={() =>
              setHiddenTypes(
                hiddenTypes.includes(type.id)
                  ? hiddenTypes.filter((id) => id !== type.id)
                  : [...hiddenTypes, type.id]
              )
            }
          >
            <i style={{ background: type.color }} />
            {type.name}
          </button>
        ))}
        <button
          className="reset-filters"
          onClick={() => {
            setQuery("");
            setHiddenTypes([]);
          }}
        >
          Reset filters
        </button>
      </div>
      <TimelineToolbar
        viewport={viewport}
        mode={mode}
        onMode={setMode}
        onPan={pan}
        onZoom={(factor) => setViewport(zoomViewport(viewport, factor))}
        onFit={() => setViewport(fitEntries(filtered))}
        onJump={(position) => {
          const half = (viewport.end - viewport.start) / 2;
          setViewport({ start: position - half, end: position + half });
        }}
      />
      {demoState !== "ready" ? (
        <div
          className="empty-state"
          role={demoState === "error" ? "alert" : "status"}
        >
          <span className="empty-symbol">
            {demoState === "error" ? "!" : "◌"}
          </span>
          <h2>
            {demoState === "error"
              ? "This chapter could not be loaded"
              : "Gathering your sources…"}
          </h2>
          <p>
            {demoState === "error"
              ? "Your source entries are still here. Try loading the view again."
              : "A simulated loading state from the prototype lab."}
          </p>
          <button onClick={() => setDemoState("ready")}>
            {demoState === "error" ? "Try again" : "Finish simulated loading"}
          </button>
        </div>
      ) : !visible.length ? (
        <div className="empty-state">
          <span className="empty-symbol">—</span>
          <h2>
            {!scoped.length
              ? "Every history starts somewhere"
              : "No entries in this view"}
          </h2>
          <p>
            {!scoped.length
              ? readOnly
                ? "No entries have been included in this shared view."
                : "Add an entry or include a live source to begin."
              : "Try another date range, search, or type filter."}
          </p>
          <div className="form-actions">
            <button
              onClick={() => {
                setQuery("");
                setHiddenTypes([]);
                setViewport(fitEntries(scoped));
              }}
            >
              Reset view
            </button>
            {!readOnly && (
              <button className="primary" onClick={onAdd}>
                Add first entry
              </button>
            )}
          </div>
        </div>
      ) : mode === "timeline" ? (
        <TimelineCanvas
          entries={visible}
          sources={lanes}
          types={visibleTypes}
          viewport={viewport}
          onPan={pan}
          onSelect={(items) =>
            items.length === 1 ? onSelect(items[0]) : onGroup(items)
          }
        />
      ) : (
        <EntryList
          key={`${timelineId}-${query}-${hiddenTypes.join(",")}-${viewport.start}-${viewport.end}`}
          entries={visible}
          timelines={sources}
          types={visibleTypes}
          onSelect={onSelect}
        />
      )}
      <footer className="explorer-footer">
        <span>
          {visible.length.toLocaleString()} of {scoped.length.toLocaleString()}{" "}
          entries in view
        </span>
        <span>
          {mode === "timeline"
            ? "Scroll horizontally · drag ruler · use arrow keys"
            : "Chronological order · dates retain their recorded precision"}
        </span>
      </footer>
    </section>
  );
}
