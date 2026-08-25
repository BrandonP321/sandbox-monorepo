import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { PROTOTYPE_STORAGE_KEY } from "./rsvp/prototypeStorage";

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

  it("exposes the RSVP integration callback", () => {
    const handleStartRsvp = vi.fn();

    render(<App onStartRsvp={handleStartRsvp} />);

    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));

    expect(handleStartRsvp).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("heading", { level: 1, name: "Household attendance" })
    ).toBeInTheDocument();
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

  it("switches among synthetic households without exposing a guest directory", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
    expect(screen.getByText("Rowan Hart")).toBeInTheDocument();
    expect(screen.getByText("Ellis Hart")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Demo household" }), {
      target: { value: "single-plus-one" }
    });

    expect(
      screen.getByText("Marlowe Chen", { selector: "li" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Rowan Hart")).not.toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByText(/not a guest lookup/i)).toBeInTheDocument();
  });

  it("restores the selected fictional household after remounting", async () => {
    const firstRender = render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Demo household" }), {
      target: { value: "family" }
    });

    await waitFor(() =>
      expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).not.toBeNull()
    );
    firstRender.unmount();

    render(<App />);

    expect(
      screen.getByRole("combobox", { name: "Demo household" })
    ).toHaveValue("family");
    expect(screen.getByText("Jules Bellamy")).toBeInTheDocument();
  });

  it("resets only demo data and returns to the deterministic landing state", () => {
    window.localStorage.setItem("unrelated", "keep me");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "RSVP" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Demo household" }), {
      target: { value: "family" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset demo data" }));

    expect(screen.getByRole("button", { name: "RSVP" })).toBeInTheDocument();
    expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep me");
  });

  it("falls back to the landing state for stale persisted data", () => {
    window.localStorage.setItem(
      PROTOTYPE_STORAGE_KEY,
      JSON.stringify({ version: 0, state: {} })
    );

    render(<App />);

    expect(screen.getByRole("button", { name: "RSVP" })).toBeInTheDocument();
    expect(window.localStorage.getItem(PROTOTYPE_STORAGE_KEY)).toBeNull();
  });
});
