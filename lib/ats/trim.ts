import type { Profile } from "@/lib/schema";

const MAX_SUGGESTIONS = 4;
const SUMMARY_LIMIT = 300;
const SKILLS_LIMIT = 24;

/**
 * O que enxugar quando o CV não cabe em 1 página mesmo no layout mais
 * compacto. Nada é cortado sozinho: a pessoa decide. Tópicos mais longos
 * primeiro, porque são os que mais ocupam linhas.
 */
export function suggestTrim(profile: Profile): string[] {
  const suggestions: string[] = [];

  const bullets = profile.experiences
    .flatMap((e, i) =>
      e.bullets.map((text, j) => ({ i, j, size: text.trim().length })),
    )
    .filter((t) => t.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 3);
  for (const t of bullets) {
    suggestions.push(
      `Encurte o tópico ${t.j + 1} da Experiência ${t.i + 1} (${t.size} caracteres).`,
    );
  }

  if (profile.summary.trim().length > SUMMARY_LIMIT) {
    suggestions.push(
      `Reduza o resumo (${profile.summary.trim().length} caracteres) para 2 ou 3 linhas.`,
    );
  }

  const totalSkills = profile.skills.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );
  if (totalSkills > SKILLS_LIMIT) {
    suggestions.push(
      `Deixe só as habilidades mais relevantes (hoje são ${totalSkills}).`,
    );
  }

  if (profile.certifications.length > 2) {
    suggestions.push("Remova as certificações menos relevantes para a vaga.");
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
