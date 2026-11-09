import type { CvModel } from "@/lib/pdf/cv-model";
import type { Measurement } from "@/lib/pdf/measurement";

/** Parâmetros de layout do PDF, em pontos (pt). */
export type LayoutFit = {
  level: number;
  font: number;
  lineHeight: number;
  /** Espaço acima de cada seção. */
  sectionSpacing: number;
  /** Espaço abaixo de cada experiência. */
  itemSpacing: number;
  marginV: number;
  marginH: number;
  description: string;
};

/**
 * Do mais folgado ao mais compacto, na ordem do prompt: primeiro espaçamentos,
 * depois a fonte do corpo (de 11pt até 10pt) e por fim as margens (mínimo 36).
 * Cada nível cabe tanto quanto o anterior ou mais.
 */
export const FIT_LEVELS: readonly LayoutFit[] = [
  {
    level: 0,
    font: 11,
    lineHeight: 1.35,
    sectionSpacing: 14,
    itemSpacing: 6,
    marginV: 48,
    marginH: 56,
    description: "Layout padrão",
  },
  {
    level: 1,
    font: 11,
    lineHeight: 1.3,
    sectionSpacing: 10,
    itemSpacing: 4,
    marginV: 48,
    marginH: 56,
    description: "espaçamentos reduzidos",
  },
  {
    level: 2,
    font: 10.5,
    lineHeight: 1.3,
    sectionSpacing: 10,
    itemSpacing: 4,
    marginV: 48,
    marginH: 56,
    description: "fonte do corpo em 10,5pt",
  },
  {
    level: 3,
    font: 10,
    lineHeight: 1.3,
    sectionSpacing: 10,
    itemSpacing: 4,
    marginV: 48,
    marginH: 56,
    description: "fonte do corpo em 10pt",
  },
  {
    level: 4,
    font: 10,
    lineHeight: 1.3,
    sectionSpacing: 10,
    itemSpacing: 4,
    marginV: 42,
    marginH: 46,
    description: "fonte em 10pt e margens reduzidas",
  },
  {
    level: 5,
    font: 10,
    lineHeight: 1.3,
    sectionSpacing: 10,
    itemSpacing: 4,
    marginV: 36,
    marginH: 36,
    description: "fonte em 10pt e margens mínimas (36pt)",
  },
];

export type Renderer = {
  render: (cv: CvModel, layoutFit: LayoutFit) => Promise<Uint8Array>;
  measure: (bytes: Uint8Array, layoutFit: LayoutFit) => Promise<Measurement>;
};

export type FitResult = {
  layoutFit: LayoutFit;
  bytes: Uint8Array;
  measurement: Measurement;
  /** false = nem o nível mais compacto coube: o PDF tem mais de 1 página. */
  fitted: boolean;
};

/**
 * Escolhe o ajuste menos agressivo que faz o CV caber em 1 página.
 *
 * Mede o PDF de verdade (em vez de estimar a altura do texto), então o
 * resultado é exato. Como cada nível cabe tanto quanto o anterior, usa busca
 * binária: no máximo 5 renderizações. Nunca corta conteúdo: se nada couber,
 * devolve `coube: false` com o nível mais compacto, para a interface avisar.
 */
export async function fitToOnePage(
  cv: CvModel,
  { render, measure }: Renderer,
): Promise<FitResult> {
  const cache = new Map<number, Omit<FitResult, "fitted">>();

  const attempt = async (level: number) => {
    const cached = cache.get(level);
    if (cached) return cached;
    const layoutFit = FIT_LEVELS[level];
    const bytes = await render(cv, layoutFit);
    const result = { layoutFit, bytes, measurement: await measure(bytes, layoutFit) };
    cache.set(level, result);
    return result;
  };
  const fits = (r: { measurement: Measurement }) => r.measurement.pages <= 1;

  const firstResult = await attempt(0);
  if (fits(firstResult)) return { ...firstResult, fitted: true };

  const lastLevel = FIT_LEVELS.length - 1;
  const mostCompact = await attempt(lastLevel);
  if (!fits(mostCompact)) return { ...mostCompact, fitted: false };

  let low = 1;
  let high = lastLevel; // já sabemos que este cabe
  while (low < high) {
    const middle = (low + high) >> 1;
    if (fits(await attempt(middle))) high = middle;
    else low = middle + 1;
  }
  return { ...(await attempt(high)), fitted: true };
}
