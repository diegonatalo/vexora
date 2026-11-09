import type { ReadPage, Measurement } from "@/types/pdf";

/** Parâmetros de layout que a medição precisa conhecer. */
export type MeasuredLayout = {
  marginV: number;
  font: number;
  lineHeight: number;
};

/** Fração do tamanho da fonte abaixo da linha de base (hastes de g, p, ç…). */
const DESCENDER = 0.21;

export function measurePages(
  pages: ReadPage[],
  layout: MeasuredLayout,
  images: number,
): Measurement {
  const text = pages.map((p) => p.text).join("\n");
  if (pages.length === 0) {
    return { pages: 0, text, images, usedPct: 0, freeLines: 0 };
  }

  const usable = pages[0].height - 2 * layout.marginV;
  const lastPage = pages[pages.length - 1];
  const items = lastPage.items.filter((i) => i.str.trim() !== "");
  const bottom = items.length
    ? Math.min(...items.map((i) => i.y - i.size * DESCENDER))
    : lastPage.height - layout.marginV;

  const usedOnLast = lastPage.height - layout.marginV - bottom;
  const total = (pages.length - 1) * usable + usedOnLast;
  const free = bottom - layout.marginV;

  return {
    pages: pages.length,
    text,
    images,
    usedPct: Math.round((total / usable) * 100),
    freeLines:
      pages.length === 1
        ? Math.max(0, Math.floor(free / (layout.font * layout.lineHeight)))
        : 0,
  };
}
