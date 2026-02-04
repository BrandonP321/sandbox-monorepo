import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "@repo/ui/styles";

import App from "./App";
import { store } from "./store";
import { UiProvider } from "@repo/ui";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <UiProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </UiProvider>
  </StrictMode>
);
