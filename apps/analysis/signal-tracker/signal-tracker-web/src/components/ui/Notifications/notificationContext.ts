import { createContext } from "react";

import type { NotificationContextValue } from "./types";

const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export { NotificationContext };
