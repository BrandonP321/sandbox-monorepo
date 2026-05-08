import { AppShell } from "@/components/ui";

import { signalTrackerAppShellRoutes } from "./routes";

function SignalTrackerAppShell() {
  return (
    <AppShell
      routes={signalTrackerAppShellRoutes}
      sidebarLabel="Signal Tracker navigation"
    />
  );
}

export { SignalTrackerAppShell };
