import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import type * as React from "react";

import { cn } from "@/lib/utils";

import { Alert } from "../Alert";
import { Button } from "../Button";
import { ContentHeader } from "../ContentHeader";
import {
  ErrorNotificationProvider,
  NotificationAlerts
} from "../Notifications";
import {
  DialogContext,
  useDialogContext,
  type DialogContextValue
} from "./DialogContext";

type DialogProps = Pick<
  React.ComponentProps<typeof DialogPrimitive.Root>,
  "children" | "defaultOpen" | "onOpenChange" | "open"
>;

type DialogTriggerProps = Pick<
  React.ComponentProps<typeof DialogPrimitive.Trigger>,
  "children"
>;

type DialogContentProps = Pick<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "children" | "className" | "role"
> & {
  description?: ReactNode;
  error?: DialogErrorProps;
  footer?: ReactNode;
  showCloseButton?: boolean;
  title: ReactNode;
};

type DialogErrorProps = {
  message?: ReactNode;
  title?: ReactNode;
};

type DialogCloseProps = Pick<
  React.ComponentProps<typeof DialogPrimitive.Close>,
  "children"
>;

type DialogConfirmActionsProps = {
  cancelText?: string;
  confirmText?: string;
  loadingText?: string;
  onConfirm: () => Promise<void> | void;
};

function Dialog({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen
}: DialogProps) {
  const [isDialogConfirming, setIsDialogConfirming] = useState(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const closeDialog = useCallback(() => {
    if (!isDialogConfirming) {
      setOpen(false);
    }
  }, [isDialogConfirming, setOpen]);

  const runDialogConfirm = useCallback(
    async <T,>(action: () => Promise<T>) => {
      setIsDialogConfirming(true);

      try {
        const result = await action();
        setIsDialogConfirming(false);
        setOpen(false);
        return { data: result, ok: true } as const;
      } catch (error) {
        setIsDialogConfirming(false);
        return { error, ok: false } as const;
      }
    },
    [setOpen]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isDialogConfirming && !nextOpen) {
        return;
      }

      setOpen(nextOpen);
    },
    [isDialogConfirming, setOpen]
  );

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      closeDialog,
      isDialogConfirming,
      open,
      runDialogConfirm,
      setOpen
    }),
    [closeDialog, isDialogConfirming, open, runDialogConfirm, setOpen]
  );

  return (
    <ErrorNotificationProvider>
      <DialogContext.Provider value={contextValue}>
        <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
          {children}
        </DialogPrimitive.Root>
      </DialogContext.Provider>
    </ErrorNotificationProvider>
  );
}

function DialogTrigger({ children }: DialogTriggerProps) {
  return <DialogPrimitive.Trigger asChild>{children}</DialogPrimitive.Trigger>;
}

function DialogContent({
  children,
  className,
  description,
  error,
  footer,
  role,
  showCloseButton = true,
  title
}: DialogContentProps) {
  const { isDialogConfirming } = useDialogContext();
  const descriptionProps = description ? {} : { "aria-describedby": undefined };
  const roleProps = role ? { role } : {};

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          "bg-foreground/30 fixed inset-0 z-50 backdrop-blur-[1px]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        )}
      />
      <DialogPrimitive.Content
        {...descriptionProps}
        {...roleProps}
        className={cn(
          "bg-card text-card-foreground border-border/80 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-xl border p-5 shadow-xl supports-[height:100dvh]:max-h-[calc(100dvh-2rem)] sm:p-6",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
      >
        <ContentHeader
          description={description}
          headingLevel={2}
          renderDescription={({
            children,
            className: descriptionClassName
          }) => (
            <DialogPrimitive.Description
              data-slot="dialog-description"
              className={descriptionClassName}
            >
              {children}
            </DialogPrimitive.Description>
          )}
          renderHeading={({ children, className: headingClassName }) => (
            <DialogPrimitive.Title
              data-slot="dialog-title"
              className={headingClassName}
            >
              {children}
            </DialogPrimitive.Title>
          )}
          title={title}
        />

        {children}

        {error?.message ? (
          <Alert title={error.title} variant="danger">
            {error.message}
          </Alert>
        ) : null}

        <NotificationAlerts />

        {footer ? (
          <div
            data-slot="dialog-footer"
            className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end"
          >
            {footer}
          </div>
        ) : null}

        {showCloseButton ? (
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className={cn(
              "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg transition-[background-color,color,opacity]",
              "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-40"
            )}
            disabled={isDialogConfirming}
          >
            <X aria-hidden="true" className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogClose({ children }: DialogCloseProps) {
  const { isDialogConfirming } = useDialogContext();

  return (
    <DialogPrimitive.Close asChild disabled={isDialogConfirming}>
      {children}
    </DialogPrimitive.Close>
  );
}

function DialogConfirmActions({
  cancelText = "Cancel",
  confirmText = "Confirm",
  loadingText = "Confirming...",
  onConfirm
}: DialogConfirmActionsProps) {
  const { isDialogConfirming, runDialogConfirm } = useDialogContext();

  async function handleConfirm() {
    await runDialogConfirm(async () => {
      await onConfirm();
    });
  }

  return (
    <>
      <DialogClose>
        <Button disabled={isDialogConfirming} variant="outline">
          {cancelText}
        </Button>
      </DialogClose>
      <Button
        isLoading={isDialogConfirming}
        loadingLabel={loadingText}
        onClick={() => void handleConfirm()}
      >
        {confirmText}
      </Button>
    </>
  );
}

export {
  Dialog,
  DialogClose,
  DialogConfirmActions,
  DialogContent,
  DialogTrigger,
  type DialogCloseProps,
  type DialogConfirmActionsProps,
  type DialogContentProps,
  type DialogErrorProps,
  type DialogProps,
  type DialogTriggerProps
};
