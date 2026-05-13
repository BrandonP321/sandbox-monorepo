import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@repo/dashboard-ui";
import {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogContent,
  DeleteConfirmationDialogTrigger
} from "./DeleteConfirmationDialog";

describe("DeleteConfirmationDialog", () => {
  it("requires matching confirmation text before delete confirmation can run", async () => {
    const handleConfirm = vi.fn(() => Promise.resolve());

    render(
      <DeleteConfirmationDialog>
        <DeleteConfirmationDialogTrigger>
          <Button>Open delete confirmation</Button>
        </DeleteConfirmationDialogTrigger>
        <DeleteConfirmationDialogContent
          confirmationText="Public affairs watchlist"
          onConfirm={handleConfirm}
          title="Delete topic permanently?"
        >
          This permanently removes the topic.
        </DeleteConfirmationDialogContent>
      </DeleteConfirmationDialog>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open delete confirmation" })
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();

    fireEvent.change(
      screen.getByRole("textbox", {
        name: "Type Public affairs watchlist to delete."
      }),
      {
        target: { value: "Public affairs watchlist" }
      }
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    });

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders delete confirmation errors as danger alerts", () => {
    render(
      <DeleteConfirmationDialog>
        <DeleteConfirmationDialogTrigger>
          <Button>Open delete confirmation</Button>
        </DeleteConfirmationDialogTrigger>
        <DeleteConfirmationDialogContent
          confirmationText="Public affairs watchlist"
          error={{
            message: "The delete request failed.",
            title: "Unable to delete topic"
          }}
          onConfirm={() => Promise.resolve()}
          title="Delete topic permanently?"
        >
          This permanently removes the topic.
        </DeleteConfirmationDialogContent>
      </DeleteConfirmationDialog>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open delete confirmation" })
    );

    const alert = screen.getByRole("alert");
    const deleteButton = screen.getByRole("button", {
      name: "Delete"
    });
    const footer = deleteButton.closest("[data-slot='dialog-footer']");

    expect(alert).toHaveTextContent("Unable to delete topic");
    expect(alert).toHaveTextContent("The delete request failed.");
    expect(alert.nextElementSibling).toBe(footer);
  });

  it("renders contextual alerts before the confirmation input", () => {
    render(
      <DeleteConfirmationDialog>
        <DeleteConfirmationDialogTrigger>
          <Button>Open delete confirmation</Button>
        </DeleteConfirmationDialogTrigger>
        <DeleteConfirmationDialogContent
          alert={{
            content: "Archive the topic if you may need it again.",
            title: "Consider archiving first",
            variant: "warning"
          }}
          confirmationText="Public affairs watchlist"
          onConfirm={() => Promise.resolve()}
          title="Delete topic permanently?"
        >
          This permanently removes the topic.
        </DeleteConfirmationDialogContent>
      </DeleteConfirmationDialog>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open delete confirmation" })
    );

    const alert = screen.getByRole("alert");
    const input = screen.getByRole("textbox", {
      name: "Type Public affairs watchlist to delete."
    });

    expect(alert).toHaveTextContent("Consider archiving first");
    expect(alert.compareDocumentPosition(input)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("renders custom cancel and delete button text", () => {
    render(
      <DeleteConfirmationDialog>
        <DeleteConfirmationDialogTrigger>
          <Button>Open delete confirmation</Button>
        </DeleteConfirmationDialogTrigger>
        <DeleteConfirmationDialogContent
          cancelButton={{ text: "Keep workspace" }}
          confirmationText="Public affairs watchlist"
          deleteButton={{ text: "Delete workspace" }}
          onConfirm={() => Promise.resolve()}
          title="Delete workspace?"
        >
          This permanently removes the workspace.
        </DeleteConfirmationDialogContent>
      </DeleteConfirmationDialog>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Open delete confirmation" })
    );

    expect(
      screen.getByRole("button", { name: "Keep workspace" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete workspace" })
    ).toBeDisabled();
  });
});
