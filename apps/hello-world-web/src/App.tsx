import upperFirst from "lodash/upperFirst";

import { useGetHelloQuery } from "./services/helloApi";

export default function App() {
  const { data, isError, isLoading, isSuccess } = useGetHelloQuery();
  const message = data?.message ? upperFirst(data.message) : "";

  return (
    <main className="app">
      <h1>Hello World (frontend)</h1>
      {isLoading && (
        <p className="muted">Loading backend message...</p>
      )}
      {isError && (
        <p className="error">Backend says: unable to reach the API.</p>
      )}
      {isSuccess && <p>Backend says: {message}</p>}
    </main>
  );
}
