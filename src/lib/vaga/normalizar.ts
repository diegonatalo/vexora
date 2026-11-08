/**
 * Normaliza para comparar: minúsculas, sem acentos, sem pontuação.
 * Mantém `+` e `#` (c++, c#) e junta pontos dentro de palavras
 * ("Next.js" e "next js" viram formas próximas: "nextjs" / "next js").
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/([a-z0-9])\.(?=[a-z0-9])/g, "$1")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
}

export function tokenizar(texto: string): string[] {
  const n = normalizar(texto);
  return n === "" ? [] : n.split(" ");
}

/** A sequência `forma` aparece em `tokens`? (palavra inteira, não pedaço). */
export function contemSequencia(tokens: string[], forma: string[]): boolean {
  if (forma.length === 0) return false;
  for (let i = 0; i + forma.length <= tokens.length; i++) {
    if (forma.every((t, k) => tokens[i + k] === t)) return true;
  }
  return false;
}
