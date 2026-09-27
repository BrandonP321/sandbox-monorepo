import { useState } from "react";
import { viewportLabel, datePosition, validDate } from "../dates";
import type { Viewport } from "../model";

export function TimelineToolbar({
  viewport,
  mode,
  onMode,
  onZoom,
  onPan,
  onFit,
  onJump
}: {
  viewport: Viewport;
  mode: "timeline" | "list";
  onMode: (mode: "timeline" | "list") => void;
  onZoom: (factor: number) => void;
  onPan: (fraction: number) => void;
  onFit: () => void;
  onJump: (position: number) => void;
}) {
  const [year, setYear] = useState("1865");
  const [era, setEra] = useState<"BCE" | "CE">("CE");
  const [error, setError] = useState("");
  return (
    <div className="timeline-toolbar">
      <div className="view-toggle" aria-label="View mode">
        <button
          aria-pressed={mode === "timeline"}
          onClick={() => onMode("timeline")}
        >
          ↔ <span>Timeline</span>
        </button>
        <button aria-pressed={mode === "list"} onClick={() => onMode("list")}>
          ☷ <span>List</span>
        </button>
      </div>
      <div className="zoom-controls">
        <button aria-label="Pan earlier" onClick={() => onPan(-0.25)}>
          ←
        </button>
        <span className="visible-range" aria-label="Visible date range">
          {viewportLabel(viewport.start, viewport.end - viewport.start)} —{" "}
          {viewportLabel(viewport.end, viewport.end - viewport.start)}
        </span>
        <button aria-label="Pan later" onClick={() => onPan(0.25)}>
          →
        </button>
        <span className="control-divider" />
        <button aria-label="Zoom out" onClick={() => onZoom(1.6)}>
          −
        </button>
        <button aria-label="Zoom in" onClick={() => onZoom(1 / 1.6)}>
          +
        </button>
        <button onClick={onFit}>Fit view</button>
      </div>
      <form
        className="jump-form"
        onSubmit={(event) => {
          event.preventDefault();
          const date = { year: Number(year), era };
          if (!validDate(date)) {
            setError("Enter a year from 1 to 9999; no year zero.");
            return;
          }
          setError("");
          onJump(datePosition(date));
        }}
      >
        <label className="sr-only" htmlFor="jump-year">
          Jump to year
        </label>
        <input
          id="jump-year"
          inputMode="numeric"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
        <label className="sr-only" htmlFor="jump-era">
          Jump era
        </label>
        <select
          id="jump-era"
          value={era}
          onChange={(event) =>
            setEra(event.target.value === "BCE" ? "BCE" : "CE")
          }
        >
          <option>CE</option>
          <option>BCE</option>
        </select>
        <button aria-label="Jump to date">Go ↗</button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
