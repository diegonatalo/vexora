"use client";

import { BUTTON } from "@/components/ui/styles";
import { Icon } from "@/components/ui/icons";
import { useTheme } from "@/hooks/use-theme";
import { THEME_KEY } from "@/lib/storage-keys";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme(THEME_KEY);
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
