import type { ReactNode } from "react";
import upperFirst from "lodash/upperFirst";
import { Button } from "@repo/ui";
import { ArrowRight } from "@repo/ui/icons";

import { useGetHelloQuery } from "./services/helloApi";

export default function App() {
  const { data, isError, isLoading, isSuccess } = useGetHelloQuery();
  const message = data?.message ? upperFirst(data.message) : "";

  let statusMessage: ReactNode = null;

  if (isLoading) {
    statusMessage = (
      <p className="app-status app-status--muted" role="status">
        Loading backend message...
      </p>
    );
  } else if (isError) {
    statusMessage = (
      <p className="app-status app-status--error" role="alert">
        Backend says: unable to reach the API.
      </p>
    );
  } else if (isSuccess) {
    statusMessage = (
      <p className="app-status" role="status">
        Backend says: {message}
      </p>
    );
  }

  return (
    <main className="app-shell">
      <section className="app-card">
        <header className="app-header">
          <p className="app-kicker">Sandbox Monorepo</p>
          <h1 className="app-title">Hello World (frontend)</h1>
        </header>

        <div className="app-actions">
          <Button iconRight={ArrowRight}>Click me</Button>
        </div>

        {statusMessage}
      </section>
    </main>
  );
}
