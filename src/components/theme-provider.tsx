"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ColorThemeContext = React.createContext<{
  colorTheme: string;
  setColorTheme: (theme: string) => void;
}>({
  colorTheme: "default",
  setColorTheme: () => {},
});

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ColorThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [colorTheme, setColorTheme] = React.useState("default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("color-theme") || "default";
    setColorTheme(savedTheme);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      document.body.classList.remove(
        "theme-default",
        "theme-rose",
        "theme-blue",
        "theme-green",
        "theme-orange"
      );
      document.body.classList.add(`theme-${colorTheme}`);
      localStorage.setItem("color-theme", colorTheme);
    }
  }, [colorTheme, mounted]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}
