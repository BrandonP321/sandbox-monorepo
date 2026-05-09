import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AttributeEditor } from "./AttributeEditor";

const items = [
  { id: "item-1", label: "First value" },
  { id: "item-2", label: "Second value" }
];

describe("AttributeEditor", () => {
  it("renders labels, row controls, row details, and accessible actions", () => {
    render(
      <AttributeEditor
        getRowKey={(row) => row.id}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
        renderRowDetails={({ row }) => <span>Details for {row.label}</span>}
        rowDefinitions={[
          {
            control: ({ row }) => (
              <input
                aria-label={`Attribute key for ${row.label}`}
                defaultValue={row.label}
              />
            ),
            label: "Attribute key"
          },
          {
            control: ({ row }) => (
              <textarea
                aria-label={`Attribute note for ${row.label}`}
                defaultValue={`Note for ${row.label}`}
              />
            ),
            label: "Attribute note"
          }
        ]}
        rows={items}
      />
    );

    expect(screen.getAllByText("Attribute key")).toHaveLength(3);
    expect(screen.getAllByText("Attribute note")).toHaveLength(3);
    expect(
      screen.getByRole("textbox", { name: "Attribute key for First value" })
    ).toHaveValue("First value");
    expect(
      screen.getByRole("textbox", { name: "Attribute note for Second value" })
    ).toHaveValue("Note for Second value");
    expect(screen.getByText("Details for First value")).toBeInTheDocument();
    expect(screen.getByText("Details for Second value")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add new item" })).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
  });

  it("calls add and remove handlers", () => {
    const handleAddRow = vi.fn();
    const handleRemoveRow = vi.fn();

    render(
      <AttributeEditor
        getRowKey={(row) => row.id}
        onAddRow={handleAddRow}
        onRemoveRow={handleRemoveRow}
        rowDefinitions={[
          {
            control: ({ row }) => <span>{row.label}</span>,
            label: "Value"
          }
        ]}
        rows={items}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add new item" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]!);

    expect(handleAddRow).toHaveBeenCalledTimes(1);
    expect(handleRemoveRow).toHaveBeenCalledWith(items[1], 1);
  });

  it("supports custom action labels", () => {
    render(
      <AttributeEditor
        addButtonLabel="Add URL"
        getRowKey={(row) => row.id}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
        removeButtonLabel={(_row, index) => `Remove row ${index + 1}`}
        rowDefinitions={[
          {
            control: ({ row }) => <span>{row.label}</span>,
            label: "Value"
          }
        ]}
        rows={items}
      />
    );

    expect(screen.getByRole("button", { name: "Add URL" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove row 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove row 2" })
    ).toBeInTheDocument();
  });

  it("uses a responsive control grid with a configurable minimum width", () => {
    const { container } = render(
      <AttributeEditor
        controlMinWidth="18rem"
        getRowKey={(row) => row.id}
        onAddRow={vi.fn()}
        onRemoveRow={vi.fn()}
        rowDefinitions={[
          {
            control: ({ row }) => <span>{row.label}</span>,
            label: "Value"
          }
        ]}
        rows={items}
      />
    );

    expect(
      container.querySelector('[data-slot="attribute-editor-header"]')
    ).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(min(18rem, 100%), 1fr))"
    });
  });
});
