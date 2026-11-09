import type { ZodType } from "zod";

type Pai = Record<PropertyKey, unknown> | unknown[];

function irAte(raiz: unknown, caminho: PropertyKey[]): Pai | undefined {
  let atual = raiz;
  for (const chave of caminho) {
    if (typeof atual !== "object" || atual === null) return undefined;
    atual = (atual as Record<PropertyKey, unknown>)[chave];
  }
  return typeof atual === "object" && atual !== null
    ? (atual as Pai)
    : undefined;
}

/**
 * Recupera um rascunho salvo que ficou inválido (e-mail pela metade, data
 * fora do padrão): corta textos longos e esvazia os campos inválidos, mantendo
 * o resto. Devolve null se o dado não tem conserto (estrutura errada).
 */
export function sanitizar<T>(schema: ZodType<T>, bruto: unknown): T | null {
  if (typeof bruto !== "object" || bruto === null) return null;
  const copia: unknown = structuredClone(bruto);

  for (let passada = 0; passada < 5; passada++) {
    const resultado = schema.safeParse(copia);
    if (resultado.success) return resultado.data;

    for (const issue of resultado.error.issues) {
      if (issue.path.length === 0) return null;
      const pai = irAte(copia, issue.path.slice(0, -1));
      const chave = issue.path[issue.path.length - 1];
      if (!pai) return null;
      const registro = pai as Record<PropertyKey, unknown>;
      const valor = registro[chave];

      if (typeof valor === "string") {
        registro[chave] =
          issue.code === "too_big" && "maximum" in issue
            ? valor.slice(0, Number(issue.maximum))
            : "";
      } else if (Array.isArray(valor) && issue.code === "too_big") {
        valor.length = Number((issue as { maximum: number }).maximum);
      } else {
        return null;
      }
    }
  }
  return null;
}
