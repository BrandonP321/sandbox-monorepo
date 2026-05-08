import { createContext } from "react";

type AppShellContextValue = {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export { AppShellContext, type AppShellContextValue };
