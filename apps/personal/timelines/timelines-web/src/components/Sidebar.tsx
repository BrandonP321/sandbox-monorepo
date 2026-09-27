import type { Timeline } from "../model";
type Props = {
  timelines: Timeline[];
  timelineId: string;
  typeCount: number;
  revisionCount: number;
  onChoose: (id: string) => void;
  onTypes: () => void;
  onReview: () => void;
  onLab: () => void;
};
export function Sidebar({
  timelines,
  timelineId,
  typeCount,
  revisionCount,
  onChoose,
  onTypes,
  onReview,
  onLab
}: Props) {
  return (
    <aside className="sidebar">
      <a className="wordmark" href="#workspace-main">
        <span className="brand-mark" aria-hidden="true">
          t<span>·</span>
        </span>
        timelines
      </a>
      <div className="workspace-label">
        <span className="avatar">BP</span>
        <span>
          Personal workspace<small>A place for connections</small>
        </span>
      </div>
      <span className="eyebrow nav-heading">YOUR TIMELINES</span>
      <nav aria-label="Your timelines">
        {timelines.map((item) => (
          <button
            key={item.id}
            aria-current={item.id === timelineId ? "page" : undefined}
            onClick={() => onChoose(item.id)}
          >
            <span className="nav-source-mark" style={{ color: item.color }}>
              {item.includes.length ? "▤" : "—"}
            </span>
            {item.title}
            {item.id === timelineId && <span className="nav-active-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-tools">
        <span className="eyebrow nav-heading">WORKSPACE TOOLS</span>
        <button onClick={() => onTypes()}>
          <span aria-hidden="true">◈</span> Type library
          <span>{typeCount}</span>
        </button>
        <button onClick={() => onReview()}>
          <span aria-hidden="true">↶</span> Review & revisions
          <span>{revisionCount}</span>
        </button>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span aria-hidden="true">↗</span>
          <p>
            History makes more sense
            <br />
            when you see the connections.
          </p>
        </div>
        <button className="prototype-link" onClick={() => onLab()}>
          <span className="live-dot" /> Prototype lab <span>↗</span>
        </button>
        <small>Synthetic data · saved for this session</small>
      </div>
    </aside>
  );
}
