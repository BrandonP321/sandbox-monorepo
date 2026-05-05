import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("renders an accessible loading status", () => {
    render(<LoadingState label="Loading active topics" />);

    const status = screen.getByRole("status");

    expect(status).toHaveTextContent("Loading active topics");
    expect(
      status.querySelector("[data-slot='loading-state-spinner']")
    ).toHaveAttribute("aria-hidden", "true");
  });
});
