import type { ZodType } from "zod";

type Parent = Record<PropertyKey, unknown> | unknown[];

function goTo(raiz: unknown, path: PropertyKey[]): Parent | undefined {
  let current = raiz;
  for (const key of path) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<PropertyKey, unknown>)[key];
  }
  return typeof current === "object" && current !== null
    ? (current as Parent)
    : undefined;
}

/**
 * Recupera um rascunho salvo que ficou inválido (e-mail pela metade, data
 * fora do padrão): corta textos longos e esvazia os campos inválidos, mantendo
 * o resto. Devolve null se o dado não tem conserto (estrutura errada).
 */
export function sanitize<T>(schema: ZodType<T>, raw: unknown): T | null {
  if (typeof raw !== "object" || raw === null) return null;
  const copy: unknown = structuredClone(raw);

  for (let pass = 0; pass < 5; pass++) {
    const result = schema.safeParse(copy);
    if (result.success) return result.data;

    for (const issue of result.error.issues) {
      if (issue.path.length === 0) return null;
      const parent = goTo(copy, issue.path.slice(0, -1));
      const key = issue.path[issue.path.length - 1];
      if (!parent) return null;
      const registro = parent as Record<PropertyKey, unknown>;
      const value = registro[key];

      if (typeof value === "string") {
        registro[key] =
          issue.code === "too_big" && "maximum" in issue
            ? value.slice(0, Number(issue.maximum))
            : "";
      } else if (Array.isArray(value) && issue.code === "too_big") {
        value.length = Number((issue as { maximum: number }).maximum);
      } else {
        return null;
      }
    }
  }
  return null;
}
