import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from "./AlertDialog";
import { useDialogContext } from "./DialogContext";
import { Button } from "./Button";

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
        description="Alert dialog description"
        onConfirm={() => undefined}
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
        confirmText="Delete"
        description="Confirm before continuing with the async alert action."
        loadingText="Deleting..."
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
    expect(screen.getByText("Alert dialog description")).toBeInTheDocument();
    expect(screen.getByText("Alert dialog body")).toBeInTheDocument();
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
          cancelText="Keep"
          confirmText="Discard"
          description="Choose whether to keep or discard the current work."
          loadingText="Discarding..."
          onConfirm={() => undefined}
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
});
