/**
 * Helvetica é uma das 14 fontes padrão do PDF (equivalente ao Arial): não
 * precisa ser embutida e mantém o texto real, selecionável e legível por ATS.
 */
export const FONT = "Helvetica";
export const FONT_BOLD = "Helvetica-Bold";

export const USED_FONTS: readonly string[] = [FONT, FONT_BOLD];

/** Famílias que os ATS leem sem problema (padrão do PDF, sem embutir). */
export const COMPATIBLE_FONTS: readonly string[] = [
  "Helvetica",
  "Helvetica-Bold",
  "Arial",
  "Arial-Bold",
  "Times-Roman",
  "Times-Bold",
  "Courier",
  "Courier-Bold",
];
