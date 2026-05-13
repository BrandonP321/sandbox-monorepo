import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNotifications } from "@repo/ui-base/notifications";

import { Button } from "@repo/dashboard-ui";
import {
  Dialog,
  DialogClose,
  DialogConfirmActions,
  DialogContent,
  DialogTrigger
} from "./Dialog";
import { useDialogContext } from "./DialogContext";

function wait(milliseconds = 1000) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function DialogExample({
  onOpenChange
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent
        description="Dialog description"
        footer={
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        }
        title="Dialog heading"
      >
        <p>Dialog body</p>
        <DialogStatus />
      </DialogContent>
    </Dialog>
  );
}

function DialogStatus() {
  const { open } = useDialogContext();

  return <p>Dialog is {open ? "open" : "closed"}</p>;
}

function ConfirmingDialogExample() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent footer={<ConfirmingDialogActions />} title="Async dialog">
        <p>Async dialog body</p>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmingDialogActions() {
  return (
    <DialogConfirmActions loadingText="Saving..." onConfirm={() => wait()} />
  );
}

function FailingDialogExample({
  onResult
}: {
  onResult: (ok: boolean) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent
        footer={<FailingDialogActions onResult={onResult} />}
        title="Async dialog"
      >
        <p>Async dialog body</p>
      </DialogContent>
    </Dialog>
  );
}

function FailingDialogActions({
  onResult
}: {
  onResult: (ok: boolean) => void;
}) {
  const { runDialogConfirm } = useDialogContext();

  async function handleConfirm() {
    const result = await runDialogConfirm(async () => {
      throw new Error("Save failed");
    });

    onResult(result.ok);
  }

  return <Button onClick={() => void handleConfirm()}>Confirm</Button>;
}

function DialogNotificationButton() {
  const { notifyError } = useNotifications();

  return (
    <Button
      onClick={() =>
        notifyError({
          content: "The archive request failed.",
          header: "Unable to archive topic"
        })
      }
    >
      Show notification
    </Button>
  );
}

describe("Dialog", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens from the trigger and renders opinionated content", () => {
    render(<DialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName("Dialog heading");
    expect(dialog).toHaveAccessibleDescription("Dialog description");
    expect(
      screen.getByRole("heading", { name: "Dialog heading" })
    ).toBeInTheDocument();
    expect(screen.getByText("Dialog description")).toBeInTheDocument();
    expect(screen.getByText("Dialog body")).toBeInTheDocument();
    expect(screen.getByText("Dialog is open")).toBeInTheDocument();
  });

  it("closes from the close action", () => {
    render(<DialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("passes open changes through the root component", () => {
    const handleOpenChange = vi.fn();

    render(<DialogExample onOpenChange={handleOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  it("constrains content to the viewport and allows scrolling", () => {
    render(<DialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog")).toHaveClass(
      "max-h-[calc(100vh-2rem)]",
      "supports-[height:100dvh]:max-h-[calc(100dvh-2rem)]",
      "overflow-y-auto"
    );
  });

  it("keeps the dialog open while confirmation is running and closes after success", async () => {
    vi.useFakeTimers();
    render(<ConfirmingDialogExample />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the dialog open and returns failure state after rejected confirmation", async () => {
    const handleResult = vi.fn();
    render(<FailingDialogExample onResult={handleResult} />);

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(handleResult).toHaveBeenCalledWith(false);
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders dialog errors directly above footer actions", () => {
    render(
      <Dialog>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent
          error={{
            message: "Save failed.",
            title: "Unable to save"
          }}
          footer={<Button>Retry</Button>}
          title="Dialog with error"
        >
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    const alert = screen.getByRole("alert");
    const retryButton = screen.getByRole("button", { name: "Retry" });
    const footer = retryButton.closest("[data-slot='dialog-footer']");

    expect(alert).toHaveTextContent("Unable to save");
    expect(alert).toHaveTextContent("Save failed.");
    expect(alert.nextElementSibling).toBe(footer);
  });

  it("does not render an error alert when the error message is missing", () => {
    render(
      <Dialog>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent
          error={{
            message: undefined,
            title: "Unable to save"
          }}
          footer={<Button>Retry</Button>}
          title="Dialog without error message"
        >
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders caught error notifications directly above footer actions", () => {
    render(
      <Dialog>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent
          footer={<Button>Retry</Button>}
          title="Dialog with notification"
        >
          <DialogNotificationButton />
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    fireEvent.click(screen.getByRole("button", { name: "Show notification" }));

    const alert = screen.getByRole("alert");
    const retryButton = screen.getByRole("button", { name: "Retry" });
    const footer = retryButton.closest("[data-slot='dialog-footer']");
    const alertSurface = alert.closest("[data-slot='notification-alerts']");

    expect(alert).toHaveTextContent("Unable to archive topic");
    expect(alert).toHaveTextContent("The archive request failed.");
    expect(alertSurface?.nextElementSibling).toBe(footer);
  });

  it("renders custom confirm action labels", () => {
    render(
      <Dialog>
        <DialogTrigger>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent
          footer={
            <DialogConfirmActions
              cancelText="Dismiss"
              confirmText="Archive"
              loadingText="Archiving..."
              onConfirm={() => undefined}
            />
          }
          title="Custom actions"
        >
          <p>Custom action body</p>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
  });
});
