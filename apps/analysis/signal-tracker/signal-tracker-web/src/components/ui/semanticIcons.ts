import { Settings, type LucideIcon } from "lucide-react";

const uiIcons = {
  settings: Settings
} satisfies Record<string, LucideIcon>;

type UiIconName = keyof typeof uiIcons;
type UiIcon = (typeof uiIcons)[UiIconName];

export { uiIcons, type UiIcon, type UiIconName };
