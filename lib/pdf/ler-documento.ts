import type { PaginaLida } from "@/lib/pdf/medicao";

type OpsDeImagem = {
  paintImageXObject: number;
  paintInlineImageXObject: number;
  paintImageMaskXObject: number;
};

/** O mínimo que usamos do pdfjs (vale para o build de navegador e o legacy de Node). */
type DocumentoPdf = {
  numPages: number;
  getPage(n: number): Promise<{
    view: number[];
    getTextContent(): Promise<{ items: unknown[] }>;
    getOperatorList(): Promise<{ fnArray: ArrayLike<number> }>;
  }>;
};

type ItemDoPdf = { str: string; transform: number[]; hasEOL?: boolean };

const ehTexto = (i: unknown): i is ItemDoPdf =>
  typeof i === "object" &&
  i !== null &&
  typeof (i as ItemDoPdf).str === "string" &&
  Array.isArray((i as ItemDoPdf).transform);

/** Extrai texto (com posição) e conta imagens de um PDF aberto pelo pdfjs. */
export async function lerDocumento(
  doc: DocumentoPdf,
  ops: OpsDeImagem,
): Promise<{ paginas: PaginaLida[]; imagens: number }> {
  const paginas: PaginaLida[] = [];
  let imagens = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    const itens = conteudo.items.filter(ehTexto);

    paginas.push({
      altura: pagina.view[3] - pagina.view[1],
      itens: itens.map((i) => ({
        str: i.str,
        y: i.transform[5],
        tamanho: Math.hypot(i.transform[2], i.transform[3]),
      })),
      texto: itens.map((i) => i.str + (i.hasEOL ? "\n" : "")).join(""),
    });

    const lista = await pagina.getOperatorList();
    for (const op of Array.from(lista.fnArray)) {
      if (
        op === ops.paintImageXObject ||
        op === ops.paintInlineImageXObject ||
        op === ops.paintImageMaskXObject
      ) {
        imagens++;
      }
    }
  }
  return { paginas, imagens };
}
