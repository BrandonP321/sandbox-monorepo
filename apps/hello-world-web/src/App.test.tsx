import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "./App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders backend message", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ apiBaseUrl: "http://localhost:3001" })
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Hello World (backend)" })
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(screen.getByText("Hello World (frontend)")).toBeInTheDocument();

    const message = await screen.findByText(
      "Backend says: Hello World (backend)"
    );

    expect(message).toBeInTheDocument();
  });
});
