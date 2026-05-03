import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import type { DbBackedRequestContext } from "../api/db-backed-request";
import { useDbBackedRequest } from "./useDbBackedRequest";

afterEach(() => {
  vi.useRealTimers();
});

describe("useDbBackedRequest", () => {
  it("moves from loading to success", async () => {
    render(<Harness request={async () => "loaded"} />);

    fireEvent.click(screen.getByRole("button", { name: "Run request" }));

    expect(screen.getByLabelText("Request status")).toHaveTextContent(
      "loading"
    );
    expect(await screen.findByText("success: loaded")).toBeInTheDocument();
  });

  it("moves to waking after the configured threshold", async () => {
    vi.useFakeTimers();
    render(
      <Harness
        request={async () =>
          new Promise<string>((resolve) => {
            window.setTimeout(() => resolve("loaded"), 1_000);
          })
        }
        wakeUpDelayMs={500}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Run request" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByLabelText("Request status")).toHaveTextContent("waking");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(screen.getByLabelText("Request status")).toHaveTextContent(
      "success: loaded"
    );
  });

  it("moves to error on final failure", async () => {
    render(
      <Harness
        request={async () => {
          throw new Error("failed");
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Run request" }));

    expect(await screen.findByText("error")).toBeInTheDocument();
  });
});

type HarnessProps = {
  request: (context: DbBackedRequestContext) => Promise<string>;
  wakeUpDelayMs?: number;
};

function Harness({ request, wakeUpDelayMs }: HarnessProps) {
  const { run, state } = useDbBackedRequest(request, {
    wakeUpDelayMs,
    requestTimeoutMs: 5_000
  });

  return (
    <div>
      <button type="button" onClick={() => void run()}>
        Run request
      </button>
      <p aria-label="Request status">
        {state.status === "success" ? `success: ${state.data}` : state.status}
      </p>
    </div>
  );
}
