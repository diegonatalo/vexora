"use client";

import { useSyncExternalStore } from "react";
import { BUTTON } from "@/components/ui/styles";
import { Icon } from "@/components/ui/icons";
import { subscribeTheme, setTheme, currentTheme, type Theme } from "@/lib/theme";

export const ThemeToggle = () => {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    currentTheme,
    () => "light",
  );
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={BUTTON.icon}
      aria-pressed={dark}
      aria-label="Tema escuro"
      title={dark ? "Voltar ao tema claro" : "Usar o tema escuro"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <Icon name={dark ? "sun" : "moon"} size={18} />
    </button>
  );
};
