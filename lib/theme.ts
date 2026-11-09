export type Theme = "claro" | "escuro";

const KEY = "folha:tema";
const EVENT = "folha:tema";
const MEDIA_DARK = "(prefers-color-scheme: dark)";

/** Tema em uso: a escolha da pessoa ou, sem escolha, a do sistema. */
export function currentTheme(): Theme {
  const escolhido = document.documentElement.dataset.theme;
  if (escolhido === "dark") return "escuro";
  if (escolhido === "light") return "claro";
  return window.matchMedia(MEDIA_DARK).matches ? "escuro" : "claro";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === "escuro" ? "dark" : "light";
  try {
    localStorage.setItem(KEY, theme === "escuro" ? "dark" : "light");
  } catch {
    // Armazenamento bloqueado: o tema vale só nesta visita.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia(MEDIA_DARK);
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}
