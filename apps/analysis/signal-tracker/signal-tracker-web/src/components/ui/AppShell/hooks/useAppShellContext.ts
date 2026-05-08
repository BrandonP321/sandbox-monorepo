import { useContext } from "react";

import { AppShellContext } from "../context";

function useAppShellContext() {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShellContext must be used inside AppShell.");
  }

  return context;
}

export { useAppShellContext };
