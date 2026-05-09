import { useState, type ReactNode } from "react";

import { FormField, TextInput } from "../Form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  type AlertDialogButtonProps,
  type AlertDialogConfirmButtonProps,
  type AlertDialogContentProps,
  type AlertDialogProps,
  type AlertDialogTriggerProps
} from "./AlertDialog";

type DeleteConfirmationDialogDeleteButtonProps = Pick<
  AlertDialogConfirmButtonProps,
  "loadingText" | "text"
>;

type DeleteConfirmationDialogCancelButtonProps = Pick<
  AlertDialogButtonProps,
  "text"
>;

type DeleteConfirmationDialogContentProps = Omit<
  AlertDialogContentProps,
  "cancelButton" | "confirmButton" | "contentAfterAlert" | "onConfirm"
> & {
  cancelButton?: DeleteConfirmationDialogCancelButtonProps;
  deleteButton?: DeleteConfirmationDialogDeleteButtonProps;
  confirmationPrompt?: ReactNode;
  confirmationText: string;
  onConfirm: () => Promise<void>;
};

type DeleteConfirmationDialogProps = AlertDialogProps;

type DeleteConfirmationDialogTriggerProps = AlertDialogTriggerProps;

function DeleteConfirmationDialog(props: DeleteConfirmationDialogProps) {
  return <AlertDialog {...props} />;
}

function DeleteConfirmationDialogTrigger(
  props: DeleteConfirmationDialogTriggerProps
) {
  return <AlertDialogTrigger {...props} />;
}

function DeleteConfirmationDialogContent({
  cancelButton,
  children,
  confirmationPrompt,
  confirmationText,
  deleteButton,
  onConfirm,
  ...contentProps
}: DeleteConfirmationDialogContentProps) {
  const [confirmationInputValue, setConfirmationInputValue] = useState("");
  const isConfirmed = confirmationInputValue === confirmationText;
  const cancelText = cancelButton?.text ?? "Cancel";
  const deleteText = deleteButton?.text ?? "Delete";
  const loadingText = deleteButton?.loadingText ?? "Deleting...";
  const prompt = confirmationPrompt ?? (
    <>
      Type{" "}
      <span className="font-medium text-foreground">{confirmationText}</span> to
      delete.
    </>
  );

  return (
    <AlertDialogContent
      {...contentProps}
      cancelButton={{ text: cancelText, variant: "outline" }}
      confirmButton={{
        disabled: !isConfirmed,
        loadingText,
        text: deleteText,
        variant: "danger"
      }}
      contentAfterAlert={
        <FormField
          label={prompt}
          labelClassName="text-muted-foreground font-normal"
        >
          {(inputProps) => (
            <TextInput
              {...inputProps}
              onChange={(event) =>
                setConfirmationInputValue(event.target.value)
              }
              value={confirmationInputValue}
            />
          )}
        </FormField>
      }
      onConfirm={onConfirm}
    >
      <div className="grid gap-3">
        <div className="text-muted-foreground text-sm">{children}</div>
      </div>
    </AlertDialogContent>
  );
}

export {
  DeleteConfirmationDialog,
  DeleteConfirmationDialogContent,
  DeleteConfirmationDialogTrigger,
  type DeleteConfirmationDialogCancelButtonProps,
  type DeleteConfirmationDialogContentProps,
  type DeleteConfirmationDialogDeleteButtonProps,
  type DeleteConfirmationDialogProps,
  type DeleteConfirmationDialogTriggerProps
};
