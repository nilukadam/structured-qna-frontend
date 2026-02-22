// FILE: src/context/ThemeContext.jsx
import React, { createContext, useEffect, useState } from "react";

/**
 * ThemeContext
 * --------------------------------------------------
 * - Manages dark/light mode
 * - Saves to localStorage
 * - Applies Bootstrap 5.3 theme via data-bs-theme
 */

export const ThemeContext = createContext(null);

const LS_KEY = "qc:theme";

export function ThemeProvider({ children }) {
  // Load from localStorage
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved === "dark" || saved === "light" ? saved : "light";
    } catch {
      return "light";
    }
  });

  // Apply + persist theme
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, theme);
    } catch {}

    const root = document.documentElement;
    root.setAttribute("data-bs-theme", theme);
    document.body.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
 