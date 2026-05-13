import { AppShell } from "@repo/dashboard-ui/tanstack-router";

import { signalTrackerAppShellRoutes } from "./routes";

function SignalTrackerAppShell() {
  return (
    <AppShell
      contentClassName="pt-0 sm:pt-0 lg:pt-0"
      notificationFlashbarClassName="mx-auto w-full max-w-6xl"
      routes={signalTrackerAppShellRoutes}
      sidebarBrand={<SignalTrackerSidebarBrand />}
      sidebarLabel="Signal Tracker navigation"
    />
  );
}

function SignalTrackerSidebarBrand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span
        aria-hidden="true"
        className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold"
      >
        ST
      </span>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">
          Signal Tracker
        </p>
        <p className="text-muted-foreground truncate text-xs">
          Continuity workspace
        </p>
      </div>
    </div>
  );
}

export { SignalTrackerAppShell };
