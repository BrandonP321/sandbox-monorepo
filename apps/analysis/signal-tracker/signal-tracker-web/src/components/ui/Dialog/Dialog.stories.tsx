import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "@repo/dashboard-ui";
import {
  Dialog,
  DialogClose,
  DialogConfirmActions,
  DialogContent,
  DialogTrigger
} from "./Dialog";
import { useDialogContext } from "./DialogContext";

const meta = {
  title: "UI/Dialog",
  component: Dialog
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function wait(milliseconds = 2400) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function DialogStory() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent
        description="Dialog content is reserved for focused work that needs explicit dismissal."
        footer={
          <DialogConfirmActions
            loadingText="Saving..."
            onConfirm={() => wait()}
          />
        }
        title="Dialog heading"
      >
        <p className="text-sm">
          Use this primitive for generic dialog surfaces before adding
          product-specific topic or entry behavior.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ManualDialogStory() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open manual dialog</Button>
      </DialogTrigger>
      <DialogContent
        description="This example uses the Dialog context directly for a custom footer."
        footer={<ManualDialogFooter />}
        title="Manual dialog actions"
      >
        <div className="grid gap-3 text-sm">
          <p>
            This layout keeps the standard dialog shell while giving the footer
            direct control over extra actions and async confirmation behavior.
          </p>
          <div className="border-border/80 bg-card rounded-lg border p-3 text-muted-foreground shadow-xs">
            Manual actions can read confirmation state, close the dialog, or run
            an async confirm handler from context.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DialogErrorStory() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Resolve issue</Button>
      </DialogTrigger>
      <DialogContent
        description="The error alert stays near the actions so users can retry without losing context."
        error={{
          message: "The request failed. Review the message and try again.",
          title: "Unable to save changes"
        }}
        footer={
          <DialogConfirmActions
            loadingText="Retrying..."
            onConfirm={() => wait()}
          />
        }
        title="Retry save?"
      >
        <p className="text-sm">
          Dialog-level errors should describe failed work that happened inside
          the dialog and should remain visible above the footer actions.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ThrowingConfirmDialogStory() {
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleConfirm() {
    setErrorMessage(undefined);
    await wait(800);
    setErrorMessage("The save request failed after confirmation started.");
    throw new globalThis.Error("Save request failed");
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Open failing dialog</Button>
      </DialogTrigger>
      <DialogContent
        description="The dialog stays open when the confirmation callback rejects."
        error={{
          message: errorMessage,
          title: "Unable to save changes"
        }}
        footer={
          <DialogConfirmActions
            confirmText="Save changes"
            loadingText="Saving..."
            onConfirm={handleConfirm}
          />
        }
        title="Save changes?"
      >
        <p className="text-sm">
          This story exercises the rejected confirmation path instead of
          rendering a static error state.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ManualDialogFooter() {
  const { closeDialog, isDialogConfirming, runDialogConfirm } =
    useDialogContext();

  async function handleConfirm() {
    await runDialogConfirm(() => wait(1800));
  }

  return (
    <>
      <Button
        disabled={isDialogConfirming}
        onClick={closeDialog}
        variant="ghost"
      >
        Save draft
      </Button>
      <DialogClose>
        <Button disabled={isDialogConfirming} variant="outline">
          Cancel
        </Button>
      </DialogClose>
      <Button
        isLoading={isDialogConfirming}
        loadingLabel="Publishing..."
        onClick={() => void handleConfirm()}
      >
        Publish
      </Button>
    </>
  );
}

export const Basic: Story = {
  render: () => <DialogStory />
};

export const ManualFooter: Story = {
  render: () => <ManualDialogStory />
};

export const Error: Story = {
  render: () => <DialogErrorStory />
};

export const ConfirmThrows: Story = {
  render: () => <ThrowingConfirmDialogStory />
};
