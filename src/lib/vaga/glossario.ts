import bruto from "@/lib/vaga/glossario.json";
import { tokenizar } from "@/lib/vaga/normalizar";

export type Categoria =
  | "linguagem"
  | "framework"
  | "ferramenta"
  | "pratica"
  | "idioma"
  | "competencia";

export type EntradaGlossario = {
  /** Como o termo aparece no CV e na tela. */
  termo: string;
  sinonimos: string[];
  categoria: Categoria;
  /** O termo em si é ambíguo ("Go", ".NET"): só os sinônimos contam. */
  apenasSinonimos?: boolean;
};

export type TermoCompilado = {
  termo: string;
  categoria: Categoria;
  /** Todas as formas aceitas, já normalizadas e separadas em palavras. */
  formas: string[][];
};

export function compilarGlossario(
  entradas: EntradaGlossario[],
): TermoCompilado[] {
  return entradas.map((e) => {
    const textos = e.apenasSinonimos ? e.sinonimos : [e.termo, ...e.sinonimos];
    const formas = textos.map(tokenizar).filter((f) => f.length > 0);
    return { termo: e.termo, categoria: e.categoria, formas };
  });
}

/** O glossário editável: acrescente linhas em glossario.json. */
export const GLOSSARIO = compilarGlossario(bruto as EntradaGlossario[]);
