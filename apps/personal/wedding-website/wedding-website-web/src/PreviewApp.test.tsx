import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PreviewApp } from "./PreviewApp";
beforeEach(() => {
  window.history.replaceState(null, "", "/");
  window.localStorage.clear();
});
describe("public Wedding preview", () => {
  it("shows the normal landing page with no login", () => {
    render(<PreviewApp />);
    expect(
      screen.getByRole("heading", { name: "Niamh & Brandon" })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });
  it.each(["/faq", "/registry", "/wedding-day"])(
    "renders normal %s content",
    (path) => {
      window.history.replaceState(null, "", path);
      render(<PreviewApp />);
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "RSVP preview" })
      ).not.toBeInTheDocument();
    }
  );
  it("RSVP navigation shows an explicit disabled notice with no form or network", () => {
    const fetcher = vi.spyOn(globalThis, "fetch");
    render(<PreviewApp />);
    fireEvent.click(
      within(screen.getByRole("main")).getByRole("link", { name: "RSVP" })
    );
    expect(
      screen.getByRole("heading", { name: "RSVP preview" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRestore();
  });
  it("opens admin key entry without fetching guest records", () => {
    window.history.replaceState(null, "", "/admin");
    const fetcher = vi.spyOn(globalThis, "fetch");
    render(<PreviewApp />);
    expect(screen.getByLabelText(/admin.*key|access key/i)).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRestore();
  });
});
