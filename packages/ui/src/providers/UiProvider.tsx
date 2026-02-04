import type { ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

import { uiTheme } from "../theme/theme";

type UiProviderProps = {
  children: ReactNode;
};

export function UiProvider({ children }: UiProviderProps) {
  return <MantineProvider theme={uiTheme}>{children}</MantineProvider>;
}
