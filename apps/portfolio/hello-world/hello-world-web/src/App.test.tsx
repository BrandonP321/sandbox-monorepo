import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { helloWorldRoutes } from "@repo/hello-world-shared";

import App from "./App";
import { helloApi } from "./services/helloApi";

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

afterEach(() => {
  vi.clearAllMocks();
});

const createTestStore = () =>
  configureStore({
    reducer: {
      [helloApi.reducerPath]: helloApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(helloApi.middleware)
  });

const renderApp = () => {
  const testStore = createTestStore();
  return render(
    <Provider store={testStore}>
      <App />
    </Provider>
  );
};

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

      if (url === `http://localhost:3001${helloWorldRoutes.getHello.path}`) {
        return jsonResponse({ message: "Hello World (backend)" });
      }

      return new Response("Not Found", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp();

    expect(screen.getByText("Hello World (frontend)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();

    const message = await screen.findByText(
      "Backend says: Hello World (backend)"
    );

    expect(message).toBeInTheDocument();
  });

  it("renders an error message when the backend fails", async () => {
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

      if (url === `http://localhost:3001${helloWorldRoutes.getHello.path}`) {
        return new Response("Server error", { status: 500 });
      }

      return new Response("Not Found", { status: 404 });
    });

    vi.stubGlobal("fetch", fetchMock);

    renderApp();

    const errorMessage = await screen.findByText(
      "Backend says: unable to reach the API."
    );

    expect(errorMessage).toBeInTheDocument();
  });
});
