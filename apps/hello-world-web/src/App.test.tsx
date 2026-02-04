import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./store";

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders backend message", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.endsWith("/config.json")) {
        return jsonResponse({ apiBaseUrl: "http://localhost:3001" });
      }

      if (url === "http://localhost:3001/hello") {
        return jsonResponse({ message: "Hello World (backend)" });
      }

      return new Response("Not Found", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText("Hello World (frontend)")).toBeInTheDocument();

    const message = await screen.findByText(
      "Backend says: Hello World (backend)"
    );

    expect(message).toBeInTheDocument();
  });
});
