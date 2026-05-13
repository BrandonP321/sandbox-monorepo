import type { ReactNode } from "react";

import { Alert, type AlertProps } from "@repo/dashboard-ui";
import { Button } from "@repo/dashboard-ui";
import type { ButtonProps } from "@repo/dashboard-ui";
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

type AlertDialogAlertProps = {
  content: ReactNode;
  title?: ReactNode;
  variant?: AlertProps["variant"];
};

type AlertDialogButtonProps = {
  text?: string;
  variant?: ButtonProps["variant"];
};

type AlertDialogConfirmButtonProps = AlertDialogButtonProps & {
  disabled?: boolean;
  loadingText?: string;
};

type AlertDialogContentProps = Omit<
  DialogContentProps,
  "children" | "description" | "footer" | "role" | "showCloseButton"
> & {
  alert?: AlertDialogAlertProps;
  cancelButton?: AlertDialogButtonProps;
  children: ReactNode;
  confirmButton?: AlertDialogConfirmButtonProps;
  contentAfterAlert?: ReactNode;
  onConfirm: () => Promise<void>;
};

function AlertDialog(props: AlertDialogProps) {
  return <Dialog {...props} />;
}

function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <DialogTrigger {...props} />;
}

function AlertDialogContent({
  alert,
  cancelButton,
  children,
  confirmButton,
  contentAfterAlert,
  onConfirm,
  ...contentProps
}: AlertDialogContentProps) {
  const { isDialogConfirming, runDialogConfirm } = useDialogContext();
  const cancelText = cancelButton?.text ?? "Cancel";
  const cancelVariant = cancelButton?.variant ?? "outline";
  const confirmDisabled = confirmButton?.disabled ?? false;
  const confirmText = confirmButton?.text ?? "Confirm";
  const confirmVariant = confirmButton?.variant ?? "default";
  const loadingText = confirmButton?.loadingText ?? "Confirming...";

  async function handleConfirm() {
    await runDialogConfirm(onConfirm);
  }

  return (
    <DialogContent
      {...contentProps}
      footer={
        <>
          <DialogClose>
            <Button disabled={isDialogConfirming} variant={cancelVariant}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            disabled={confirmDisabled}
            isLoading={isDialogConfirming}
            loadingLabel={loadingText}
            onClick={() => void handleConfirm()}
            variant={confirmVariant}
          >
            {confirmText}
          </Button>
        </>
      }
      role="alertdialog"
      showCloseButton={false}
    >
      <div className="grid gap-4">
        <div>{children}</div>
        {alert ? (
          <Alert title={alert.title} variant={alert.variant}>
            {alert.content}
          </Alert>
        ) : null}
        {contentAfterAlert}
      </div>
    </DialogContent>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  type AlertDialogAlertProps,
  type AlertDialogButtonProps,
  type AlertDialogContentProps,
  type AlertDialogConfirmButtonProps,
  type AlertDialogProps,
  type AlertDialogTriggerProps
};
