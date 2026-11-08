import type { Perfil } from "@/lib/schema";

const MAX_SUGESTOES = 4;
const LIMITE_RESUMO = 300;
const LIMITE_HABILIDADES = 24;

/**
 * O que enxugar quando o CV não cabe em 1 página mesmo no layout mais
 * compacto. Nada é cortado sozinho: a pessoa decide. Tópicos mais longos
 * primeiro, porque são os que mais ocupam linhas.
 */
export function sugerirEnxugar(perfil: Perfil): string[] {
  const sugestoes: string[] = [];

  const topicos = perfil.experiencias
    .flatMap((e, i) =>
      e.topicos.map((texto, j) => ({ i, j, tamanho: texto.trim().length })),
    )
    .filter((t) => t.tamanho > 0)
    .sort((a, b) => b.tamanho - a.tamanho)
    .slice(0, 3);
  for (const t of topicos) {
    sugestoes.push(
      `Encurte o tópico ${t.j + 1} da Experiência ${t.i + 1} (${t.tamanho} caracteres).`,
    );
  }

  if (perfil.resumo.trim().length > LIMITE_RESUMO) {
    sugestoes.push(
      `Reduza o resumo (${perfil.resumo.trim().length} caracteres) para 2 ou 3 linhas.`,
    );
  }

  const totalHabilidades = perfil.habilidades.reduce(
    (soma, g) => soma + g.itens.length,
    0,
  );
  if (totalHabilidades > LIMITE_HABILIDADES) {
    sugestoes.push(
      `Deixe só as habilidades mais relevantes (hoje são ${totalHabilidades}).`,
    );
  }

  if (perfil.certificacoes.length > 2) {
    sugestoes.push("Remova as certificações menos relevantes para a vaga.");
  }

  return sugestoes.slice(0, MAX_SUGESTOES);
}
