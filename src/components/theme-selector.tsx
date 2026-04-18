"use client";

import { useTheme } from "next-themes";
import { ColorThemeContext } from "./theme-provider";
import { useContext } from "react";
import { Button } from "./ui/button";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";

const colorThemes = [
  { name: "default", class: "bg-teal-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "green", class: "bg-green-500" },
  { name: "orange", class: "bg-orange-500" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useContext(ColorThemeContext);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          size="sm"
          className="flex-1 shadow-none"
          onClick={() => setTheme("light")}
        >
          <IconSun className="w-4 h-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          size="sm"
          className="flex-1 shadow-none"
          onClick={() => setTheme("dark")}
        >
          <IconMoon className="w-4 h-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          size="sm"
          className="flex-1 shadow-none"
          onClick={() => setTheme("system")}
        >
          <IconDeviceDesktop className="w-4 h-4 mr-2" />
          System
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Color:
        </span>
        <div className="flex items-center gap-2">
          {colorThemes.map((cTheme) => (
            <button
              key={cTheme.name}
              onClick={() => setColorTheme(cTheme.name)}
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                colorTheme === cTheme.name
                  ? "border-primary scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              title={cTheme.name}
            >
              <div className={`w-4 h-4 rounded-full ${cTheme.class}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
