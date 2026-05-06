import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from "./AlertDialog";
import { Button } from "../Button";

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
        <Button>Publish update</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        alert={{
          content:
            "This sends the latest assessment to every view that depends on the topic summary."
        }}
        confirmButton={{ loadingText: "Publishing...", text: "Publish" }}
        onConfirm={() => wait()}
        title="Publish this update?"
      >
        <p className="text-muted-foreground text-sm">
          Confirm only when the topic summary is ready to become the current
          shared assessment.
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
        cancelButton={{ text: "Keep editing" }}
        confirmButton={{
          loadingText: "Discarding...",
          text: "Discard",
          variant: "danger"
        }}
        onConfirm={() => wait(1800)}
        title="Discard changes?"
      >
        <div className="grid gap-3 text-sm">
          <p>
            The alert dialog owns the standard cancel and danger-toned confirm
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

function AlertDialogErrorStory() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="outline">Retry publish</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        alert={{
          content:
            "Publishing updates the topic summary shown across the workspace.",
          title: "Confirm the scope"
        }}
        confirmButton={{ loadingText: "Retrying...", text: "Retry" }}
        error={{
          message: "The publish request failed. The dialog remains open.",
          title: "Unable to publish update"
        }}
        onConfirm={() => wait()}
        title="Retry publishing?"
      >
        <p className="text-muted-foreground text-sm">
          The contextual alert remains with the body content, while the error
          sits near the actions that can resolve it.
        </p>
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

export const Error: Story = {
  render: () => <AlertDialogErrorStory />
};
