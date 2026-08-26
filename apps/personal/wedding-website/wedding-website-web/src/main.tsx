import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-700.css";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
