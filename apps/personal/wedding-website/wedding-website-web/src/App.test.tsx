import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import {
  LEGACY_PROTOTYPE_STORAGE_KEY,
  PROTOTYPE_STORAGE_KEY
} from "./rsvp/prototypeStorage";

beforeEach(() => {
  window.localStorage.clear();
});

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

  it("exposes the RSVP integration callback and opens a clean self-entry form", () => {
    const handleStartRsvp = vi.fn();

    render(<App onStartRsvp={handleStartRsvp} />);
    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));

    expect(handleStartRsvp).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Your party & attendance"
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(
      screen.getByRole("spinbutton", { name: /children attending/i })
    ).toHaveValue(0);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/bring a guest/i)).not.toBeInTheDocument();
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

  it("restores a version 2 self-entry draft after remounting", async () => {
    const firstRender = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
    fireEvent.click(screen.getByRole("radio", { name: "Brandon's side" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Your name" }), {
      target: { value: "Alex Example" }
    });
    fireEvent.click(screen.getByRole("radio", { name: "Attending" }));

    await waitFor(() =>
      expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).not.toBeNull()
    );
    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole("radio", { name: "Brandon's side" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue(
      "Alex Example"
    );
    expect(screen.getByRole("radio", { name: "Attending" })).toBeChecked();
  });

  it("discards stale fixture-era storage and starts with a clean draft", () => {
    window.localStorage.setItem(
      LEGACY_PROTOTYPE_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          currentStage: "attendance",
          selectedFixtureId: "family",
          draft: { householdId: "family" }
        }
      })
    );

    render(<App />);

    expect(screen.getByRole("button", { name: "RSVP" })).toBeInTheDocument();
    expect(
      window.localStorage.getItem(LEGACY_PROTOTYPE_STORAGE_KEY)
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
    expect(screen.getByRole("textbox", { name: "Your name" })).toHaveValue("");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
