import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/code-highlight/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";

import App from "./App";
import "./index.css";
import { store } from "./store";
import { createTheme, MantineProvider } from "@mantine/core";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const theme = createTheme({});

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Provider store={store}>
        <App />
      </Provider>
    </MantineProvider>
  </StrictMode>
);
