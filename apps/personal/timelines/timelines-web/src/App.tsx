import { useState } from "react";
import { resolveSources, type Entry } from "./model";
import { useWorkspace } from "./useWorkspace";
import { EntryDetail } from "./components/EntryDetail";
import { EntryList } from "./components/EntryList";
import {
  SharePanel,
  SourcesPanel,
  TypesPanel
} from "./components/LibraryPanels";
import { ReviewPanel } from "./components/ReviewPanel";
import { Sheet } from "./components/Sheet";
import { Explorer } from "./components/Explorer";
import { Sidebar } from "./components/Sidebar";

type Panel = "sources" | "types" | "share" | "review" | "lab" | null;

export function App() {
  const [stress, setStress] = useState(false);
  return (
    <Workspace key={String(stress)} stress={stress} onStress={setStress} />
  );
}

function Workspace({
  stress,
  onStress
}: {
  stress: boolean;
  onStress: (value: boolean) => void;
}) {
  const {
    fixture,
    setFixture,
    revisions,
    message,
    setMessage,
    saveEntries,
    undo
  } = useWorkspace(stress);
  const [timelineId, setTimelineId] = useState(fixture.timelines[0].id);
  const [panel, setPanel] = useState<Panel>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry>();
  const [group, setGroup] = useState<Entry[]>();
  const [readOnly, setReadOnly] = useState(false);
  const [allowed, setAllowed] = useState<string[]>(() =>
    resolveSources(fixture.timelines, fixture.timelines[0].id)
  );
  const [demoState, setDemoState] = useState("ready");
  const timeline = fixture.timelines.find((item) => item.id === timelineId)!;
  const resolved = resolveSources(fixture.timelines, timelineId);
  const sourceIds = resolved.filter((id) => !readOnly || allowed.includes(id));
  const sources = fixture.timelines.filter((item) =>
    sourceIds.includes(item.id)
  );
  const scoped = fixture.entries.filter((entry) =>
    sourceIds.includes(entry.sourceId)
  );
  const visibleTypes = fixture.types.filter(
    (type) => !readOnly || scoped.some((entry) => entry.typeId === type.id)
  );
  const lanes = sources.filter((source) =>
    scoped.some((entry) => entry.sourceId === source.id)
  );
  const chooseTimeline = (id: string) => {
    setTimelineId(id);
    setDemoState("ready");
  };
  const addEntry = () =>
    setSelectedEntry({
      id: crypto.randomUUID(),
      sourceId: timeline.id,
      title: "",
      description: "",
      typeId: fixture.types[0].id,
      start: { year: 1865, era: "CE" },
      shape: "point",
      qualifier: "exact",
      reference: ""
    });
  const close = () => setPanel(null);
  const selectEntry = (entry: Entry) => {
    setGroup(undefined);
    setSelectedEntry(entry);
  };
  return (
    <div className={`workspace ${readOnly ? "shared-workspace" : ""}`}>
      <a className="skip-link" href="#workspace-main">
        Skip to timeline
      </a>
      {!readOnly && (
        <Sidebar
          timelines={fixture.timelines}
          timelineId={timelineId}
          typeCount={fixture.types.length}
          revisionCount={revisions.length}
          onChoose={chooseTimeline}
          onTypes={() => setPanel("types")}
          onReview={() => setPanel("review")}
          onLab={() => setPanel("lab")}
        />
      )}
      <main id="workspace-main" tabIndex={-1}>
        <header className="topbar">
          <div className="breadcrumb">
            {readOnly ? "TIMELINES / SHARED PREVIEW" : "WORKSPACE / EXPLORER"}
          </div>
          <div className="topbar-actions">
            {readOnly ? (
              <button
                onClick={() => {
                  setReadOnly(false);
                }}
              >
                Return to owner workspace
              </button>
            ) : (
              <>
                <button
                  className="review-button"
                  aria-label="Review changes"
                  onClick={() => setPanel("review")}
                >
                  <span aria-hidden="true">↶</span>{" "}
                  <span className="desktop-review-label">Review changes</span>
                  <span className="mobile-review-label">Review</span>
                  {revisions.length > 0 && (
                    <span className="count-pill">{revisions.length}</span>
                  )}
                </button>
                <button
                  className="share-button"
                  onClick={() => setPanel("share")}
                >
                  ↗ Share preview
                </button>
              </>
            )}
          </div>
        </header>
        {readOnly && (
          <div className="share-banner">
            <strong>Read-only preview</strong>
            <span>
              Only explicitly selected sources are included. No public link has
              been created.
            </span>
          </div>
        )}
        <div className="main-content">
          <section className="intro">
            <div>
              <div className="eyebrow">
                <span className="live-dot" />{" "}
                {readOnly
                  ? "A LIVE VIEW OF HISTORY"
                  : "YOUR HISTORY, CONNECTED"}
              </div>
              <h1>{timeline.title}</h1>
              <p>{timeline.description}</p>
              <div className="intro-meta">
                <span>{scoped.length.toLocaleString()} entries</span>
                <span>{lanes.length} live sources</span>
                <span>
                  {scoped.some(
                    (entry) =>
                      entry.qualifier === "before" ||
                      entry.qualifier === "after"
                  )
                    ? "Includes open dates"
                    : "Year to day precision"}
                </span>
              </div>
            </div>
            {!readOnly && (
              <button className="primary add-entry" onClick={addEntry}>
                <span aria-hidden="true">＋</span> Add entry
              </button>
            )}
          </section>
          {!readOnly && (
            <div className="mobile-workspace-tools">
              <label>
                Timeline
                <select
                  value={timelineId}
                  onChange={(event) => chooseTimeline(event.target.value)}
                >
                  {fixture.timelines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={() => setPanel("types")}>Type library</button>
              <button onClick={() => setPanel("lab")}>Prototype lab</button>
            </div>
          )}
          <Explorer
            key={`${timelineId}-${readOnly}`}
            scoped={scoped}
            sources={sources}
            visibleTypes={visibleTypes}
            timelineId={timelineId}
            readOnly={readOnly}
            demoState={demoState}
            setDemoState={setDemoState}
            onManageSources={() => setPanel("sources")}
            onAdd={addEntry}
            onSelect={selectEntry}
            onGroup={setGroup}
          />
          <section className="context-note">
            <span className="note-index">01 / FIELD NOTES</span>
            <div>
              <h2>A timeline is a point of view.</h2>
              <p>
                Follow one source, or bring several together. Each entry keeps
                its original home, so a correction travels with it.
              </p>
            </div>
            <span className="note-orbit" aria-hidden="true">
              ↗
            </span>
          </section>
          <p role="status" className="session-status">
            {message ||
              "Local prototype · illustrative fixtures · changes reset on reload"}
          </p>
        </div>
      </main>
      {panel === "sources" && !readOnly && (
        <SourcesPanel
          fixture={fixture}
          timeline={timeline}
          onClose={close}
          onChange={(includes) =>
            setFixture({
              ...fixture,
              timelines: fixture.timelines.map((item) =>
                item.id === timeline.id ? { ...item, includes } : item
              )
            })
          }
        />
      )}
      {panel === "types" && !readOnly && (
        <TypesPanel
          fixture={fixture}
          onClose={close}
          onChange={(types) => {
            setFixture({ ...fixture, types });
            setMessage("Type library updated across all timelines.");
          }}
        />
      )}
      {panel === "share" && !readOnly && (
        <SharePanel
          sources={sources}
          allowed={allowed}
          onChange={setAllowed}
          onClose={close}
          onPreview={() => {
            setReadOnly(true);
            setDemoState("ready");
            setMessage("");
            close();
          }}
        />
      )}
      {panel === "review" && !readOnly && (
        <ReviewPanel
          entries={fixture.entries}
          proposalEntries={scoped}
          revisions={revisions}
          message={message}
          onApply={saveEntries}
          onUndo={undo}
          onClose={close}
        />
      )}
      {panel === "lab" && !readOnly && (
        <Sheet title="Prototype lab" onClose={close}>
          <p className="prose">
            Explore edge cases with disposable fixtures. Switching datasets
            resets all session edits.
          </p>
          <div className="lab-options">
            <button
              onClick={() => {
                onStress(!stress);
                close();
              }}
            >
              {stress ? "Load study fixtures" : "Load 10,000-entry fixture"}
            </button>
            <button
              onClick={() => {
                setDemoState("loading");
                close();
              }}
            >
              Show loading state
            </button>
            <button
              onClick={() => {
                setDemoState("error");
                close();
              }}
            >
              Show error state
            </button>
            {!stress && (
              <>
                <button
                  onClick={() => {
                    chooseTimeline("long-view");
                    close();
                  }}
                >
                  Explore BCE / CE & sparse dates
                </button>
                <button
                  onClick={() => {
                    chooseTimeline("empty");
                    close();
                  }}
                >
                  Open empty timeline
                </button>
              </>
            )}
          </div>
          <p className="notice">
            This is a UI proof: no backend, account, public sharing, or durable
            recovery. Owner acceptance is pending.
          </p>
        </Sheet>
      )}
      {selectedEntry && (
        <EntryDetail
          key={selectedEntry.id}
          entry={selectedEntry}
          timelines={readOnly ? sources : fixture.timelines}
          types={visibleTypes}
          readOnly={readOnly}
          isNew={
            !fixture.entries.some((entry) => entry.id === selectedEntry.id)
          }
          onClose={() => setSelectedEntry(undefined)}
          onSave={(entry) => {
            saveEntries(entry.title, [entry]);
            setSelectedEntry(undefined);
          }}
        />
      )}
      {group && (
        <Sheet
          title={`${group.length} entries in this date group`}
          onClose={() => setGroup(undefined)}
          wide
        >
          <p className="prose">
            Entries may share a date or fall within the same displayed bucket.
            Periods overlap the view; before/after dates remain open bounds.
          </p>
          <EntryList
            entries={group}
            timelines={sources}
            types={visibleTypes}
            onSelect={selectEntry}
            compact
          />
        </Sheet>
      )}
    </div>
  );
}
