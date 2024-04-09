import React from "react";
import ReactDOM from "react-dom/client";
import { initializeIcons } from "@fluentui/react";

import "./index.css";

import { AppStateProvider } from "./state/AppProvider";
import App from "./App";

initializeIcons();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);
