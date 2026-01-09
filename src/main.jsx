// FILE: src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App";

/**
 * CSS load order:
 *  - bootstrap first (base utilities & variables)
 *  - Global.css for project-wide variables / helpers
 *  - index.css for app-specific overrides (keeps it last so it can override Global)
 */
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Global.css";
import "./index.css";

/** Context providers */
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { FeedProvider } from "./context/FeedContext";

/**
 * Root render
 * - Uses createRoot from react-dom/client (React 18+)
 * - ThemeProvider is outermost so data-bs-theme is applied before components mount
 */
const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element with id="root" not found in HTML.');
}

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FeedProvider>
            <App />
          </FeedProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
