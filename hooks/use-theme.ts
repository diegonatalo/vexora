import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const KEY = "vexora:theme:v1";
const EVENT = "vexora:theme:v1";
const MEDIA_DARK = "(prefers-color-scheme: dark)";

const hasChoice = () => {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "dark" || stored === "light";
  } catch {
    return false;
  }
};

/** Tema em uso: a classe dark do <html> (definida por um script antes da primeira pintura). */
export function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Armazenamento bloqueado: o tema vale só nesta visita.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia(MEDIA_DARK);
  // Sem escolha salva, acompanha o sistema.
  const onSystemChange = () => {
    if (!hasChoice()) {
      document.documentElement.classList.toggle("dark", media.matches);
    }
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onSystemChange);
  };
}

/** Tema atual, sincronizado com a classe dark do <html>. No servidor é claro. */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribeTheme, currentTheme, () => "light");
  return { theme, setTheme };
}
