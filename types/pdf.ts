/** Um trecho de texto do PDF, em coordenadas do PDF (origem no canto inferior esquerdo). */
export type ReadItem = { str: string; y: number; size: number };

export type ReadPage = { height: number; items: ReadItem[]; text: string };

export type Measurement = {
  pages: number;
  /** Texto de todas as páginas, na ordem em que um ATS o leria. */
  text: string;
  /** Quantidade de imagens desenhadas no PDF (deve ser 0). */
  images: number;
  /** Uso da página em %, acima de 100 quando passa de 1 página. */
  usedPct: number;
  /** Linhas de corpo que ainda cabem na página (0 se já passou de 1). */
  freeLines: number;
};

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

export type FitResult = {
  layoutFit: LayoutFit;
  bytes: Uint8Array;
  measurement: Measurement;
  /** false = nem o nível mais compacto coube: o PDF tem mais de 1 página. */
  fitted: boolean;
};
