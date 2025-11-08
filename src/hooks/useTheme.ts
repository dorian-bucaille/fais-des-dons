import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "fdd:theme";

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    /* noop */
  }
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* noop */
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setTheme((current) => {
        const stored = (() => {
          try {
            return window.localStorage.getItem(STORAGE_KEY);
          } catch {
            return null;
          }
        })();
        if (stored === "light" || stored === "dark") {
          return current;
        }
        return event.matches ? "dark" : "light";
      });
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggle: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
      setTheme,
    }),
    [theme],
  );
}
