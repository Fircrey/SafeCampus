"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type FontSize = "small" | "normal" | "large";

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  small: "font-sm",
  normal: "",
  large: "font-lg",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");
  const [mounted, setMounted] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("sc-theme") as Theme | null;
    const savedFontSize = localStorage.getItem("sc-font-size") as FontSize | null;

    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    }
    if (savedFontSize === "small" || savedFontSize === "normal" || savedFontSize === "large") {
      setFontSizeState(savedFontSize);
    }
    setMounted(true);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sc-theme", theme);
  }, [theme, mounted]);

  // Apply font size class to <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    // Remove all font size classes first
    root.classList.remove("font-sm", "font-lg");
    const cls = FONT_SIZE_CLASSES[fontSize];
    if (cls) root.classList.add(cls);
    localStorage.setItem("sc-font-size", fontSize);
  }, [fontSize, mounted]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const setFontSize = useCallback((s: FontSize) => setFontSizeState(s), []);
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
