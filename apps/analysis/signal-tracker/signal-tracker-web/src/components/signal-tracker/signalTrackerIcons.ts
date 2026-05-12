import { FolderKanban, Radar, type LucideIcon } from "lucide-react";

import { uiIcons } from "@/components/ui/semanticIcons";

const signalTrackerIcons = {
  ...uiIcons,
  topic: FolderKanban,
  topicEmptyState: Radar
} satisfies typeof uiIcons & Record<string, LucideIcon>;

type SignalTrackerIconName = keyof typeof signalTrackerIcons;
type SignalTrackerIcon = (typeof signalTrackerIcons)[SignalTrackerIconName];

export {
  signalTrackerIcons,
  type SignalTrackerIcon,
  type SignalTrackerIconName
};
