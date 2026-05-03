import { useState } from "react";
import { RouterProvider } from "@tanstack/react-router";

import { createSignalTrackerRouter } from "@/router";

export default function App() {
  const [router] = useState(() => createSignalTrackerRouter());

  return <RouterProvider router={router} />;
}
