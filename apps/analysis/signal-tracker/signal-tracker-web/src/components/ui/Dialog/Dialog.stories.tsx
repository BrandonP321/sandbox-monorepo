import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
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
          <div className="rounded-md border bg-muted/40 p-3 text-muted-foreground">
            Manual actions can read confirmation state, close the dialog, or run
            an async confirm handler from context.
          </div>
        </div>
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
