import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the approved landing content and meaningful photo", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Niamh & Brandon" })
    ).toBeInTheDocument();
    expect(screen.getByText("Welcome to our wedding")).toBeInTheDocument();
    expect(
      screen.getByText("We can't wait to celebrate with you!")
    ).toBeInTheDocument();

    const date = screen.getByText("August 21, 2027", { selector: "time" });
    expect(date).toHaveAttribute("datetime", "2027-08-21");

    const photo = screen.getByRole("img", {
      name: /Niamh and Brandon smiling together outdoors/i
    });
    expect(photo).toHaveAttribute("width", "600");
    expect(photo).toHaveAttribute("height", "750");
  });

  it("exposes the RSVP integration callback", () => {
    const handleStartRsvp = vi.fn();

    render(<App onStartRsvp={handleStartRsvp} />);

    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));

    expect(handleStartRsvp).toHaveBeenCalledOnce();
  });

  it("keeps decorative artwork non-semantic and non-interactive", () => {
    render(<App />);

    const decorations = screen
      .getByRole("main")
      .querySelector<HTMLElement>("[aria-hidden='true']")!;

    expect(decorations).not.toBeNull();

    const decorativeImages = decorations.querySelectorAll("img");

    expect(decorations).toHaveAttribute("aria-hidden", "true");
    expect(decorativeImages).toHaveLength(6);

    for (const image of decorativeImages) {
      expect(image).toHaveAttribute("alt", "");
      expect(image).toHaveAttribute("draggable", "false");
    }

    expect(decorations.querySelector("button, a, input")).toBeNull();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
