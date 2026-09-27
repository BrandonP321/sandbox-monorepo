import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("prototype owner flows", () => {
  it("supports pan, zoom, BCE jump, and a chronological list alternative", () => {
    render(<App />);
    const initial = screen.getByLabelText("Visible date range").textContent;
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByLabelText("Visible date range").textContent).not.toBe(
      initial
    );
    fireEvent.keyDown(screen.getByLabelText(/Timeline navigation/), {
      key: "ArrowRight"
    });
    fireEvent.change(screen.getByLabelText("Jump to year"), {
      target: { value: "509" }
    });
    fireEvent.change(screen.getByLabelText("Jump era"), {
      target: { value: "BCE" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Jump to date" }));
    expect(screen.getByLabelText("Visible date range")).toHaveTextContent(
      "BCE"
    );
    fireEvent.click(screen.getByRole("button", { name: "Fit view" }));
    fireEvent.click(screen.getByRole("button", { name: /☷ List/ }));
    expect(
      screen.getByRole("button", { name: /4 Jul 1776 A declaration/ })
    ).toBeVisible();
  });

  it("edits a source directly and displays the correction in its composite", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /☷ List/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /4 Jul 1776 A declaration/ })
    );
    expect(
      screen.getByText(/Editing changes Founding a republic and 1 linked view/)
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit source entry" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "A corrected declaration entry" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));
    expect(
      screen.getByRole("button", { name: /A corrected declaration entry/ })
    ).toBeVisible();
    fireEvent.click(
      within(
        screen.getByRole("navigation", { name: "Your timelines" })
      ).getByRole("button", { name: /Founding a republic/ })
    );
    fireEvent.click(screen.getByRole("button", { name: /☷ List/ }));
    expect(
      screen.getByRole("button", { name: /A corrected declaration entry/ })
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Review changes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Restore revision" }));
    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(
      screen.getByRole("button", { name: /A declaration of independence/ })
    ).toBeVisible();
  });

  it("keeps nested sources live when their direct inclusion is removed", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Manage sources/ }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /^Voices of reform/ })
    );
    expect(
      screen.getByText("Already included through a nested source")
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Seneca" }
    });
    expect(
      screen.getByRole("button", { name: /Seneca Falls Convention/ })
    ).toBeVisible();
  });

  it("previews a batch without changing entries, then applies and undoes it", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Review changes/ }));
    expect(
      screen.getByText(
        "No edits yet. Saved entries and batches will appear here."
      )
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Apply this exact batch" })
    );
    expect(
      screen.getByRole("button", { name: "Batch applied" })
    ).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Undo batch" }));
    expect(screen.getByText("2 entries · Restored")).toBeVisible();
  });

  it("renames a global type and uses the renamed label in filters and entries", () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Type library/ })[0]);
    fireEvent.click(
      screen.getByRole("button", { name: "Rename Politics & law" })
    );
    fireEvent.change(screen.getByLabelText("Rename type"), {
      target: { value: "Government" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save type name" }));
    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(screen.getByRole("button", { name: "Government" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    fireEvent.click(screen.getByRole("button", { name: "Government" }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "declaration" }
    });
    expect(screen.getByText("No entries in this view")).toBeVisible();
  });

  it("excludes unselected sources and owner editing tools from read-only preview", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Share preview/ }));
    fireEvent.click(
      screen.getByRole("checkbox", { name: /Founding a republic/ })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Open read-only preview" })
    );
    expect(
      screen.queryByRole("button", { name: /Add entry/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Your timelines" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Review changes/ })
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "declaration" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Fit view" }));
    expect(screen.getByText("No entries in this view")).toBeVisible();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Seneca" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Fit view" }));
    fireEvent.click(
      screen.getByRole("button", { name: /Seneca Falls Convention/ })
    );
    expect(
      screen.getByText(/Read-only view. This entry belongs/)
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Edit source entry" })
    ).not.toBeInTheDocument();
  });
});
