import { useEffect, useState } from "react";

type Status = "loading" | "ready" | "error";

type HelloResponse = {
  message: string;
};

const defaultApiUrl = "http://localhost:3001";

export default function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? defaultApiUrl;
    const endpoint = new URL("/hello", apiUrl).toString();

    fetch(endpoint)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as HelloResponse;
        setMessage(payload.message);
        setStatus("ready");
      })
      .catch(() => {
        setStatus("error");
      });
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
