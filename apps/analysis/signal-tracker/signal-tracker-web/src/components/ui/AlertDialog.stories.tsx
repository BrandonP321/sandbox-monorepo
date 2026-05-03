import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from "./AlertDialog";
import { Button } from "./Button";

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog
} satisfies Meta<typeof AlertDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function wait(milliseconds = 2400) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function AlertDialogStory() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive">Delete item</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        confirmText="Delete"
        description="This action cannot be undone. Confirm only when the user has enough context to understand the impact."
        loadingText="Deleting..."
        onConfirm={() => wait()}
        title="Delete this item?"
      >
        <p className="text-sm">
          Alert dialogs should be reserved for destructive or high-consequence
          choices that need explicit confirmation before continuing.
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CustomTextAlertDialogStory() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="outline">Discard changes</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        cancelText="Keep editing"
        confirmText="Discard"
        description="Unsaved edits will be lost if you continue."
        loadingText="Discarding..."
        onConfirm={() => wait(1800)}
        title="Discard changes?"
      >
        <div className="grid gap-3 text-sm">
          <p>
            The alert dialog owns the standard cancel and destructive confirm
            actions. Use label props to fit the action language to the context.
          </p>
          <div className="rounded-md border bg-muted/40 p-3 text-muted-foreground">
            The dialog remains open while confirmation is running, and all
            dismiss actions are disabled until the operation settles.
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const Basic: Story = {
  render: () => <AlertDialogStory />
};

export const CustomText: Story = {
  render: () => <CustomTextAlertDialogStory />
};
