import type { ReactNode } from "react";

import { Button } from "../Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  type DialogContentProps,
  type DialogProps,
  type DialogTriggerProps
} from "../Dialog";
import { useDialogContext } from "../Dialog";

type AlertDialogProps = DialogProps;

type AlertDialogTriggerProps = DialogTriggerProps;

type AlertDialogContentProps = Omit<
  DialogContentProps,
  "description" | "footer" | "role" | "showCloseButton"
> & {
  cancelText?: string;
  // TODO: Might not be needed once component is refacctored to use once Dialog is simplified
  confirmDisabled?: boolean;
  confirmText?: string;
  description: ReactNode;
  loadingText?: string;
  onConfirm: () => Promise<void> | void;
};

function AlertDialog(props: AlertDialogProps) {
  return <Dialog {...props} />;
}

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <DialogTrigger {...props} />;
}

function AlertDialogContent({
  cancelText = "Cancel",
  children,
  confirmDisabled = false,
  confirmText = "Confirm",
  description,
  loadingText = "Confirming...",
  onConfirm,
  ...contentProps
}: AlertDialogContentProps) {
  const { isDialogConfirming, runDialogConfirm } = useDialogContext();

  async function handleConfirm() {
    await runDialogConfirm(async () => {
      await onConfirm();
    });
  }

  return (
    <DialogContent
      {...contentProps}
      description={description}
      footer={
        <>
          <DialogClose>
            <Button disabled={isDialogConfirming} variant="outline">
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            disabled={confirmDisabled}
            isLoading={isDialogConfirming}
            loadingLabel={loadingText}
            onClick={() => void handleConfirm()}
            variant="danger"
          >
            {confirmText}
          </Button>
        </>
      }
      role="alertdialog"
      showCloseButton={false}
    >
      {children}
    </DialogContent>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  type AlertDialogContentProps,
  type AlertDialogProps,
  type AlertDialogTriggerProps
};
