import { createContext, useContext } from "react";

export type AppShellRegionMode = "inline" | "overlay";

export type AppShellContextValue = {
  asideId: string;
  asideMode: AppShellRegionMode;
  isAsideOpen: boolean;
  isSidebarOpen: boolean;
  setAsideOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarId: string;
  sidebarMode: AppShellRegionMode;
  toggleAside: () => void;
  toggleSidebar: () => void;
};

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useOptionalAppShell() {
  return useContext(AppShellContext);
}

export function useAppShell() {
  const context = useOptionalAppShell();

  if (!context) {
    throw new Error("useAppShell must be used within an AppShell.");
  }

  return context;
}
