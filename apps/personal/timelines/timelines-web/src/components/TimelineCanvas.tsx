import { useRef } from "react";
import { viewportLabel, entryDate, formatDate } from "../dates";
import type { Entry, EntryType, Timeline, Viewport } from "../model";
import { columnCount, groupLane } from "../timelineLayout";

export function TimelineCanvas({
  entries,
  sources,
  types,
  viewport,
  onPan,
  onSelect
}: {
  entries: Entry[];
  sources: Timeline[];
  types: EntryType[];
  viewport: Viewport;
  onPan: (fraction: number) => void;
  onSelect: (entries: Entry[]) => void;
}) {
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const span = viewport.end - viewport.start;
  return (
    <section aria-label="Horizontal timeline" className="timeline-section">
      <div
        className="timeline-scroll"
        ref={scroll}
        tabIndex={0}
        aria-label="Timeline navigation. Left and right arrow keys pan; scroll horizontally or drag the ruler."
        onWheel={(event) => {
          const element = event.currentTarget;
          const horizontal = event.shiftKey ? event.deltaY : event.deltaX;
          if (
            element.scrollWidth <= element.clientWidth &&
            !event.ctrlKey &&
            (event.shiftKey || Math.abs(horizontal) > Math.abs(event.deltaY))
          ) {
            onPan(horizontal / element.clientWidth);
          }
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            onPan(event.key === "ArrowLeft" ? -0.2 : 0.2);
          }
        }}
      >
        <div className="timeline-board">
          <div
            className="timeline-ruler"
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse" || event.button !== 0) return;
              drag.current = {
                x: event.clientX,
                scroll: scroll.current?.scrollLeft ?? 0
              };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (drag.current && scroll.current)
                scroll.current.scrollLeft =
                  drag.current.scroll - (event.clientX - drag.current.x);
            }}
            onPointerUp={(event) => {
              if (!drag.current) return;
              const delta = drag.current.x - event.clientX;
              if (
                Math.abs(delta) > 20 &&
                scroll.current &&
                scroll.current.scrollWidth <= scroll.current.clientWidth
              )
                onPan(delta / scroll.current.clientWidth);
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            <span className="ruler-label">SOURCE / DATE BUCKET</span>
            <div className="ruler-ticks">
              {Array.from({ length: columnCount }, (_, index) => (
                <span key={index}>
                  {viewportLabel(
                    viewport.start + (span * index) / columnCount,
                    span
                  )}
                </span>
              ))}
            </div>
          </div>
          {sources.map((source, index) => {
            const sourceEntries = entries.filter(
              (entry) => entry.sourceId === source.id
            );
            const groups = groupLane(sourceEntries, viewport);
            return (
              <div className="source-lane" key={source.id}>
                <div className="lane-label">
                  <span className="lane-number" style={{ color: source.color }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{source.title}</strong>
                  <span>
                    {sourceEntries.length} entries{" "}
                    <span aria-hidden="true">·</span> Live source
                  </span>
                </div>
                <div className="lane-track">
                  {Array.from({ length: columnCount }, (_, slot) => {
                    const group = groups.find(
                      (candidate) => candidate.slot === slot
                    );
                    const first = group?.entries[0];
                    const type = types.find(
                      (item) => item.id === first?.typeId
                    );
                    return (
                      <div className="lane-cell" key={slot}>
                        {first && group && (
                          <button
                            className={`timeline-mark ${group.entries.length > 1 ? "cluster" : first.shape} ${first.qualifier}`}
                            onClick={() => onSelect(group.entries)}
                            style={{ borderTopColor: source.color }}
                          >
                            <span className="mark-glyph" aria-hidden="true">
                              {group.entries.length > 1
                                ? "▦"
                                : first.shape === "period"
                                  ? "━"
                                  : first.shape === "range"
                                    ? "┄"
                                    : first.qualifier === "before"
                                      ? "←"
                                      : first.qualifier === "after"
                                        ? "→"
                                        : "●"}
                            </span>
                            <strong>
                              {group.entries.length > 1
                                ? `${group.entries.length} entries`
                                : first.title}
                            </strong>
                            <span>
                              {group.entries.length > 1
                                ? `${formatDate(first.start)} + more`
                                : entryDate(first)}
                            </span>
                            <small
                              style={{
                                color:
                                  group.entries.length === 1
                                    ? type?.color
                                    : undefined
                              }}
                            >
                              {group.entries.length > 1
                                ? "Open date group ↗"
                                : type?.name}
                            </small>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="timeline-caption">
        <span>
          <b>●</b> Event <b>━</b> Period <b>┄</b> Uncertain range <b>← →</b>{" "}
          Bound
        </span>
        <span>Grouped by date bucket · open a group for exact labels</span>
      </div>
    </section>
  );
}
