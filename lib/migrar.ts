/**
 * Dados salvos ou exportados antes das habilidades virarem grupos livres tinham
 * três listas fixas (linguagens, frameworks, ferramentas). Converte para grupos.
 * Qualquer outra forma passa intacta e é validada pelo schema.
 */
const GRUPOS_ANTIGOS = [
  ["linguagens", "Linguagens"],
  ["frameworks", "Frameworks e bibliotecas"],
  ["ferramentas", "Ferramentas"],
] as const;

export function migrarPerfil(bruto: unknown): unknown {
  if (typeof bruto !== "object" || bruto === null) return bruto;
  const perfil = bruto as Record<string, unknown>;
  const hab = perfil.habilidades;
  if (typeof hab !== "object" || hab === null || Array.isArray(hab)) {
    return bruto;
  }
  const antigas = hab as Record<string, unknown>;
  const grupos = GRUPOS_ANTIGOS.flatMap(([chave, titulo]) => {
    const itens = antigas[chave];
    return Array.isArray(itens) && itens.length > 0
      ? [{ titulo, itens, exibir: true }]
      : [];
  });
  return { ...perfil, habilidades: grupos };
}
