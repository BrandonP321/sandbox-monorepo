import { useEffect, useState } from "react";

import { loadRuntimeConfig } from "./config";

type Status = "loading" | "ready" | "error";

type HelloResponse = {
  message: string;
};

export default function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadMessage = async () => {
      try {
        const config = await loadRuntimeConfig();
        const endpoint = new URL("/hello", config.apiBaseUrl).toString();
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as HelloResponse;

        if (isMounted) {
          setMessage(payload.message);
          setStatus("ready");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    };

    loadMessage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="app">
      <h1>Hello World (frontend)</h1>
      {status === "loading" && (
        <p className="muted">Loading backend message...</p>
      )}
      {status === "error" && (
        <p className="error">Backend says: unable to reach the API.</p>
      )}
      {status === "ready" && <p>Backend says: {message}</p>}
    </main>
  );
}
