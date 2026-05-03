import { createContext, useContext } from "react";

type DialogContextValue = {
  closeDialog: () => void;
  isDialogConfirming: boolean;
  open: boolean;
  runDialogConfirm: <T>(action: () => Promise<T>) => Promise<T>;
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

export { DialogContext, useDialogContext, type DialogContextValue };
