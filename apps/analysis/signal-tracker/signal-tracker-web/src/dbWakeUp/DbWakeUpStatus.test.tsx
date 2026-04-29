import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DbWakeUpStatus } from "./DbWakeUpStatus";

afterEach(() => {
  vi.clearAllMocks();
});

describe("DbWakeUpStatus", () => {
  it("renders the non-modal wake-up status", () => {
    render(<DbWakeUpStatus state={{ status: "waking" }} onRetry={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "The database is waking up after inactivity. This can take a few seconds. Retrying automatically..."
    );
  });

  it("renders final failure with retry affordance", () => {
    const onRetry = vi.fn();

    render(
      <DbWakeUpStatus
        state={{ status: "error", error: new Error("failed") }}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The database-backed request could not be completed."
    );

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders nothing for inactive states", () => {
    const { container } = render(
      <DbWakeUpStatus state={{ status: "idle" }} onRetry={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
