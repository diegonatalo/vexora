export type Tema = "claro" | "escuro";

const CHAVE = "folha:tema";
const EVENTO = "folha:tema";
const MEDIA_ESCURO = "(prefers-color-scheme: dark)";

/** Tema em uso: a escolha da pessoa ou, sem escolha, a do sistema. */
export function temaAtual(): Tema {
  const escolhido = document.documentElement.dataset.theme;
  if (escolhido === "dark") return "escuro";
  if (escolhido === "light") return "claro";
  return window.matchMedia(MEDIA_ESCURO).matches ? "escuro" : "claro";
}

export function definirTema(tema: Tema) {
  document.documentElement.dataset.theme = tema === "escuro" ? "dark" : "light";
  try {
    localStorage.setItem(CHAVE, tema === "escuro" ? "dark" : "light");
  } catch {
    // Armazenamento bloqueado: o tema vale só nesta visita.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function assinarTema(aoMudar: () => void) {
  const media = window.matchMedia(MEDIA_ESCURO);
  window.addEventListener(EVENTO, aoMudar);
  media.addEventListener("change", aoMudar);
  return () => {
    window.removeEventListener(EVENTO, aoMudar);
    media.removeEventListener("change", aoMudar);
  };
}
