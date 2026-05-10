import { AppShell } from "@/components/ui";

import { signalTrackerAppShellRoutes } from "./routes";

function SignalTrackerAppShell() {
  return (
    <AppShell
      contentClassName="pt-0 sm:pt-0 lg:pt-0"
      routes={signalTrackerAppShellRoutes}
      sidebarLabel="Signal Tracker navigation"
    />
  );
}

export { SignalTrackerAppShell };
