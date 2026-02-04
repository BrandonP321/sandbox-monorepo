import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "./App";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App", () => {
  it("renders backend message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Hello World (backend)" })
      })
    );

    render(<App />);

    expect(screen.getByText("Hello World (frontend)")).toBeInTheDocument();

    const message = await screen.findByText(
      "Backend says: Hello World (backend)"
    );

    expect(message).toBeInTheDocument();
  });
});
