import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from "./AlertDialog";
import { Button } from "@repo/dashboard-ui";
import { useDialogContext } from "../Dialog";

function wait(milliseconds = 1000) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function AlertDialogExample({
  onOpenChange
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <AlertDialog onOpenChange={onOpenChange}>
      <AlertDialogTrigger>
        <Button>Open alert dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        alert={{
          content: "Alert dialog alert content",
          title: "Alert dialog alert title"
        }}
        onConfirm={() => Promise.resolve()}
        title="Alert dialog heading"
      >
        <p>Alert dialog body</p>
        <AlertDialogStatus />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AlertDialogStatus() {
  const { open } = useDialogContext();

  return <p>Alert dialog is {open ? "open" : "closed"}</p>;
}

function ConfirmingAlertDialogExample() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button>Open alert dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        confirmButton={{ loadingText: "Deleting...", text: "Delete" }}
        onConfirm={() => wait()}
        title="Async alert dialog"
      >
        <p>Async alert dialog body</p>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens from the trigger and renders opinionated content", () => {
    render(<AlertDialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Alert dialog heading" })
    ).toBeInTheDocument();
    expect(screen.getByText("Alert dialog body")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Alert dialog alert title"
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Alert dialog alert content"
    );
    expect(screen.getByText("Alert dialog is open")).toBeInTheDocument();
  });

  it("closes from the cancel action", () => {
    render(<AlertDialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("passes open changes through the root component", () => {
    const handleOpenChange = vi.fn();

    render(<AlertDialogExample onOpenChange={handleOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("keeps the alert dialog open while confirmation is running and closes after success", async () => {
    vi.useFakeTimers();
    render(<ConfirmingAlertDialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("renders custom confirm action labels", () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>
          <Button>Open alert dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          cancelButton={{ text: "Keep" }}
          confirmButton={{ loadingText: "Discarding...", text: "Discard" }}
          onConfirm={() => Promise.resolve()}
          title="Custom alert actions"
        >
          <p>Custom alert body</p>
        </AlertDialogContent>
      </AlertDialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));

    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });

  it("can disable the confirm action", () => {
    const handleConfirm = vi.fn();

    render(
      <AlertDialog>
        <AlertDialogTrigger>
          <Button>Open alert dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          confirmButton={{ disabled: true }}
          onConfirm={handleConfirm}
          title="Gated alert action"
        >
          <p>Gated alert body</p>
        </AlertDialogContent>
      </AlertDialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open alert dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
    expect(handleConfirm).not.toHaveBeenCalled();
  });
});
