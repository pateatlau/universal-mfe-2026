/**
 * @universal/web-shell
 * 
 * Entry point for web shell application.
 * 
 * Initializes React Native Web and renders the App component.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// React Native Web is automatically configured via Rspack resolve aliases

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

