import { Settings, type LucideIcon } from "lucide-react";

const dashboardIcons = {
  settings: Settings
} satisfies Record<string, LucideIcon>;

const uiIcons = dashboardIcons;

type DashboardIconName = keyof typeof dashboardIcons;
type DashboardIcon = (typeof dashboardIcons)[DashboardIconName];
type UiIconName = DashboardIconName;
type UiIcon = DashboardIcon;

export {
  dashboardIcons,
  uiIcons,
  type DashboardIcon,
  type DashboardIconName,
  type UiIcon,
  type UiIconName
};
