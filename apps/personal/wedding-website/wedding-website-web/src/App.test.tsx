import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the wedding website scaffold", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Wedding website" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The RSVP experience will be added in a future milestone."
      )
    ).toBeInTheDocument();
  });
});
