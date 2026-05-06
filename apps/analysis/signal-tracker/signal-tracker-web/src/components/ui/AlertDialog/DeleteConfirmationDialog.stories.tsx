import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../Button";
import {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogContent,
  DeleteConfirmationDialogTrigger
} from "./DeleteConfirmationDialog";

const meta = {
  title: "UI/DeleteConfirmationDialog",
  component: DeleteConfirmationDialogContent
} satisfies Meta<typeof DeleteConfirmationDialogContent>;

export default meta;

type Story = StoryObj;

function wait(milliseconds = 2400) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function DeleteConfirmationDialogStory() {
  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        cancelButton={{ text: "Keep topic" }}
        confirmationText="Public affairs watchlist"
        deleteButton={{ loadingText: "Deleting topic..." }}
        onConfirm={() => wait()}
        title="Delete topic permanently?"
      >
        This permanently removes the topic. Archive is the reversible way to
        hide a topic without losing history.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

function DeleteConfirmationErrorStory() {
  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        cancelButton={{ text: "Keep topic" }}
        confirmationText="Public affairs watchlist"
        error={{
          message: "The topic could not be deleted. Try again from settings.",
          title: "Unable to delete topic"
        }}
        deleteButton={{ loadingText: "Deleting topic..." }}
        onConfirm={() => wait()}
        title="Delete topic permanently?"
      >
        This permanently removes the topic. Archive is the reversible way to
        hide a topic without losing history.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

function DeleteConfirmationAlertStory() {
  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        alert={{
          content:
            "Archive is reversible. Delete permanently removes the topic row.",
          title: "Consider archiving first",
          variant: "warning"
        }}
        cancelButton={{ text: "Keep topic" }}
        confirmationText="Public affairs watchlist"
        deleteButton={{ loadingText: "Deleting topic..." }}
        onConfirm={() => wait()}
        title="Delete topic permanently?"
      >
        This permanently removes the topic. The warning stays above the
        confirmation input so the typed confirmation remains the final step.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

function DeleteConfirmationCustomPromptStory() {
  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete workspace</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        confirmationPrompt={
          <>
            Enter{" "}
            <span className="font-medium text-foreground">
              Delete workspace
            </span>{" "}
            before continuing.
          </>
        }
        confirmationText="Delete workspace"
        deleteButton={{
          loadingText: "Deleting workspace...",
          text: "Delete workspace"
        }}
        onConfirm={() => wait()}
        title="Delete workspace?"
      >
        This demonstrates a custom confirmation prompt while keeping the prompt
        as the text input label.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

function ThrowingConfirmDeleteConfirmationStory() {
  const [errorMessage, setErrorMessage] = useState<string>();

  async function handleConfirm() {
    setErrorMessage(undefined);
    await wait(800);
    setErrorMessage("The topic could not be deleted after confirmation.");
    throw new globalThis.Error("Delete request failed");
  }

  return (
    <DeleteConfirmationDialog>
      <DeleteConfirmationDialogTrigger>
        <Button variant="danger">Delete topic</Button>
      </DeleteConfirmationDialogTrigger>
      <DeleteConfirmationDialogContent
        cancelButton={{ text: "Keep topic" }}
        confirmationText="Public affairs watchlist"
        deleteButton={{
          loadingText: "Deleting topic...",
          text: "Delete permanently"
        }}
        error={{
          message: errorMessage,
          title: "Unable to delete topic"
        }}
        onConfirm={handleConfirm}
        title="Delete topic permanently?"
      >
        This story exercises a failed delete after the required confirmation
        text has been entered.
      </DeleteConfirmationDialogContent>
    </DeleteConfirmationDialog>
  );
}

export const Basic: Story = {
  render: () => <DeleteConfirmationDialogStory />
};

export const WithAlert: Story = {
  render: () => <DeleteConfirmationAlertStory />
};

export const CustomPrompt: Story = {
  render: () => <DeleteConfirmationCustomPromptStory />
};

export const Error: Story = {
  render: () => <DeleteConfirmationErrorStory />
};

export const ConfirmThrows: Story = {
  render: () => <ThrowingConfirmDeleteConfirmationStory />
};
