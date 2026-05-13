import { FolderKanban, Radar, type LucideIcon } from "lucide-react";

import { dashboardIcons } from "@repo/dashboard-ui";

const signalTrackerIcons = {
  ...dashboardIcons,
  topic: FolderKanban,
  topicEmptyState: Radar
} satisfies typeof dashboardIcons & Record<string, LucideIcon>;

type SignalTrackerIconName = keyof typeof signalTrackerIcons;
type SignalTrackerIcon = (typeof signalTrackerIcons)[SignalTrackerIconName];

export {
  signalTrackerIcons,
  type SignalTrackerIcon,
  type SignalTrackerIconName
};
