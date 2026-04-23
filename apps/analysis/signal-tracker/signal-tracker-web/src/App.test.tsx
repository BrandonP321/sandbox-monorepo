import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "./App";
import { fetchHealthStatus } from "./health";

vi.mock("./health", async () => {
  const actual = await vi.importActual<typeof import("./health")>("./health");

  return {
    ...actual,
    fetchHealthStatus: vi.fn()
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

const fetchHealthStatusMock = vi.mocked(fetchHealthStatus);

describe("App", () => {
  it("renders the loading state while the health check is in flight", () => {
    fetchHealthStatusMock.mockReturnValue(new Promise(() => undefined));

    render(<App />);

    expect(screen.getByText("Signal Tracker")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking the API scaffold..."
    );
  });

  it("renders the healthy backend state", async () => {
    fetchHealthStatusMock.mockResolvedValue({ ok: true });

    render(<App />);

    expect(
      await screen.findByText("API scaffold ready: healthy.")
    ).toBeInTheDocument();
  });

  it("renders an error message when the health check fails", async () => {
    fetchHealthStatusMock.mockRejectedValue(new Error("network"));

    render(<App />);

    expect(
      await screen.findByText("API scaffold unavailable.")
    ).toBeInTheDocument();
  });
});
