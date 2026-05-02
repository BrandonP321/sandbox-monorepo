import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the clean-slate Signal Tracker shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Signal Tracker" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify Button" })
    ).toBeInTheDocument();
  });
});
