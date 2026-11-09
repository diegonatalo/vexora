/** Um trecho de texto do PDF, em coordenadas do PDF (origem no canto inferior esquerdo). */
export type ItemLido = { str: string; y: number; tamanho: number };
export type PaginaLida = { altura: number; itens: ItemLido[]; texto: string };

export type Medicao = {
  paginas: number;
  /** Texto de todas as páginas, na ordem em que um ATS o leria. */
  texto: string;
  /** Quantidade de imagens desenhadas no PDF (deve ser 0). */
  imagens: number;
  /** Uso da página em %, acima de 100 quando passa de 1 página. */
  usadoPct: number;
  /** Linhas de corpo que ainda cabem na página (0 se já passou de 1). */
  linhasLivres: number;
};

/** Parâmetros de layout que a medição precisa conhecer. */
export type LayoutMedido = {
  margemV: number;
  fonte: number;
  lineHeight: number;
};

/** Fração do tamanho da fonte abaixo da linha de base (hastes de g, p, ç…). */
const DESCENDENTE = 0.21;

export function medirPaginas(
  paginas: PaginaLida[],
  layout: LayoutMedido,
  imagens: number,
): Medicao {
  const texto = paginas.map((p) => p.texto).join("\n");
  if (paginas.length === 0) {
    return { paginas: 0, texto, imagens, usadoPct: 0, linhasLivres: 0 };
  }

  const usavel = paginas[0].altura - 2 * layout.margemV;
  const ultima = paginas[paginas.length - 1];
  const itens = ultima.itens.filter((i) => i.str.trim() !== "");
  const fundo = itens.length
    ? Math.min(...itens.map((i) => i.y - i.tamanho * DESCENDENTE))
    : ultima.altura - layout.margemV;

  const usadoNaUltima = ultima.altura - layout.margemV - fundo;
  const total = (paginas.length - 1) * usavel + usadoNaUltima;
  const livre = fundo - layout.margemV;

  return {
    paginas: paginas.length,
    texto,
    imagens,
    usadoPct: Math.round((total / usavel) * 100),
    linhasLivres:
      paginas.length === 1
        ? Math.max(0, Math.floor(livre / (layout.fonte * layout.lineHeight)))
        : 0,
  };
}
