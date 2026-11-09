import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { fitToOnePage, FIT_LEVELS } from "@/lib/fit";
import type { LayoutFit } from "@/types/pdf";
import type { CvModel } from "@/lib/pdf/cv-model";
import { readDocument } from "@/lib/pdf/read-document";
import { measurePages } from "@/lib/pdf/measurement";
import type { Measurement } from "@/types/pdf";
import { CvDocument } from "@/components/pdf/cv-document";

// Fontes padrão do PDF (Helvetica não é embutida): só o pdfjs precisa delas.
const FONTS_DIR = "node_modules/pdfjs-dist/standard_fonts/";

export async function renderInNode(
  cv: CvModel,
  layoutFit: LayoutFit = FIT_LEVELS[0],
): Promise<Uint8Array> {
  return new Uint8Array(await renderToBuffer(CvDocument({ cv, layoutFit })));
}

/** Lê o PDF como um ATS leria: texto extraído, páginas, posições e imagens. */
export async function measureInNode(
  bytes: Uint8Array,
  layoutFit: LayoutFit = FIT_LEVELS[0],
): Promise<Measurement> {
  const task = getDocument({
    data: bytes.slice(),
    standardFontDataUrl: FONTS_DIR,
  });
  try {
    const doc = await task.promise;
    const { pages, images } = await readDocument(doc, OPS);
    return measurePages(pages, layoutFit, images);
  } finally {
    await task.destroy();
  }
}

/** Gera o PDF em um nível de ajuste (padrão: o layout base) e o mede. */
export async function generateAndRead(cv: CvModel, layoutFit: LayoutFit = FIT_LEVELS[0]) {
  const bytes = await renderInNode(cv, layoutFit);
  return { bytes, ...(await measureInNode(bytes, layoutFit)) };
}

/** O fluxo completo do app (ajuste até caber), em Node. */
export function fitInNode(cv: CvModel) {
  return fitToOnePage(cv, {
    render: renderInNode,
    measure: measureInNode,
  });
}

/** Links clicáveis do PDF (anotações do tipo Link), como um leitor os veria. */
export async function readLinks(
  bytes: Uint8Array,
): Promise<{ url: string; width: number }[]> {
  const task = getDocument({
    data: bytes.slice(),
    standardFontDataUrl: FONTS_DIR,
  });
  try {
    const doc = await task.promise;
    const links: { url: string; width: number }[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      for (const a of await page.getAnnotations()) {
        if (a.subtype === "Link" && a.url) {
          links.push({ url: a.url, width: a.rect[2] - a.rect[0] });
        }
      }
    }
    return links;
  } finally {
    await task.destroy();
  }
}
