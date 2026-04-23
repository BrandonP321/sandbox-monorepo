import { useEffect, useState } from "react";

import { fetchHealthStatus } from "./health";

type HealthState =
  | { status: "loading" }
  | { status: "ready"; ok: boolean }
  | { status: "error" };

export default function App() {
  const [healthState, setHealthState] = useState<HealthState>({
    status: "loading"
  });

  useEffect(() => {
    let isActive = true;

    void fetchHealthStatus()
      .then((result) => {
        if (isActive) {
          setHealthState({ status: "ready", ok: result.ok });
        }
      })
      .catch(() => {
        if (isActive) {
          setHealthState({ status: "error" });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Analysis Suite</p>
        <h1 className="headline">Signal Tracker</h1>
        <p className="lede">
          Full-stack scaffold in place. The product surface is intentionally
          empty until signal ingestion, scoring, and review workflows are
          designed.
        </p>

        <section className="status-panel" aria-labelledby="backend-status-title">
          <h2 id="backend-status-title">Backend connectivity</h2>
          {healthState.status === "loading" ? (
            <p className="status-text" role="status">
              Checking the API scaffold...
            </p>
          ) : null}
          {healthState.status === "ready" ? (
            <p className="status-text" role="status">
              API scaffold ready: {healthState.ok ? "healthy" : "unhealthy"}.
            </p>
          ) : null}
          {healthState.status === "error" ? (
            <p className="status-text status-text--error" role="alert">
              API scaffold unavailable.
            </p>
          ) : null}
        </section>

        <section className="placeholder-grid" aria-label="Planned modules">
          <article>
            <h2>Capture</h2>
            <p>Reserved for source ingestion and normalization.</p>
          </article>
          <article>
            <h2>Review</h2>
            <p>Reserved for analyst triage and annotation workflows.</p>
          </article>
          <article>
            <h2>Output</h2>
            <p>Reserved for scoring, summaries, and downstream exports.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
