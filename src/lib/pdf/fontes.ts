/**
 * Helvetica é uma das 14 fontes padrão do PDF (equivalente ao Arial): não
 * precisa ser embutida e mantém o texto real, selecionável e legível por ATS.
 */
export const FONTE = "Helvetica";
export const FONTE_NEGRITO = "Helvetica-Bold";

export const FONTES_USADAS: readonly string[] = [FONTE, FONTE_NEGRITO];

/** Famílias que os ATS leem sem problema (padrão do PDF, sem embutir). */
export const FONTES_COMPATIVEIS: readonly string[] = [
  "Helvetica",
  "Helvetica-Bold",
  "Arial",
  "Arial-Bold",
  "Times-Roman",
  "Times-Bold",
  "Courier",
  "Courier-Bold",
];
