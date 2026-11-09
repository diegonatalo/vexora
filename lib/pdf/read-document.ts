import type { ReadPage } from "@/lib/pdf/measurement";

type ImageOps = {
  paintImageXObject: number;
  paintInlineImageXObject: number;
  paintImageMaskXObject: number;
};

/** O mínimo que usamos do pdfjs (vale para o build de navegador e o legacy de Node). */
type PdfDocument = {
  numPages: number;
  getPage(n: number): Promise<{
    view: number[];
    getTextContent(): Promise<{ items: unknown[] }>;
    getOperatorList(): Promise<{ fnArray: ArrayLike<number> }>;
  }>;
};

type PdfItem = { str: string; transform: number[]; hasEOL?: boolean };

const isText = (i: unknown): i is PdfItem =>
  typeof i === "object" &&
  i !== null &&
  typeof (i as PdfItem).str === "string" &&
  Array.isArray((i as PdfItem).transform);

/** Extrai texto (com posição) e conta imagens de um PDF aberto pelo pdfjs. */
export async function readDocument(
  doc: PdfDocument,
  ops: ImageOps,
): Promise<{ pages: ReadPage[]; images: number }> {
  const pages: ReadPage[] = [];
  let images = 0;

  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const items = content.items.filter(isText);

    pages.push({
      height: page.view[3] - page.view[1],
      items: items.map((i) => ({
        str: i.str,
        y: i.transform[5],
        size: Math.hypot(i.transform[2], i.transform[3]),
      })),
      text: items.map((i) => i.str + (i.hasEOL ? "\n" : "")).join(""),
    });

    const list = await page.getOperatorList();
    for (const op of Array.from(list.fnArray)) {
      if (
        op === ops.paintImageXObject ||
        op === ops.paintInlineImageXObject ||
        op === ops.paintImageMaskXObject
      ) {
        images++;
      }
    }
  }
  return { pages, images };
}
