import { createContext, useContext } from "react";

type DialogConfirmResult<T> =
  | {
      data: T;
      ok: true;
    }
  | {
      error: unknown;
      ok: false;
    };

type DialogContextValue = {
  closeDialog: () => void;
  isDialogConfirming: boolean;
  open: boolean;
  runDialogConfirm: <T>(
    action: () => Promise<T>
  ) => Promise<DialogConfirmResult<T>>;
  setOpen: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialogContext must be used inside Dialog.");
  }

  return context;
}

export {
  DialogContext,
  useDialogContext,
  type DialogConfirmResult,
  type DialogContextValue
};
