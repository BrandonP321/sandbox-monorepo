import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/latin-700.css";
import "./index.css";
import { PreviewApp } from "./PreviewApp";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PreviewApp />
  </StrictMode>
);
