"use client";

import { useSyncExternalStore } from "react";
import { BUTTON } from "@/components/ui/styles";
import { Icon } from "@/components/ui/icons";
import { subscribeTheme, setTheme, currentTheme, type Theme } from "@/lib/theme";

export const ThemeToggle = () => {
  const theme = useSyncExternalStore<Theme>(
    subscribeTheme,
    currentTheme,
    () => "claro",
  );
  const escuro = theme === "escuro";
  return (
    <button
      type="button"
      className={BUTTON.icon}
      aria-pressed={escuro}
      aria-label="Tema escuro"
      title={escuro ? "Voltar ao tema claro" : "Usar o tema escuro"}
      onClick={() => setTheme(escuro ? "claro" : "escuro")}
    >
      <Icon name={escuro ? "sun" : "moon"} size={18} />
    </button>
  );
};
