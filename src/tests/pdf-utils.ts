import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { CvModel } from "@/lib/pdf/cv-model";
import { CvDocument } from "@/pdf/CvDocument";

// Fontes padrão do PDF (Helvetica não é embutida): só o pdfjs precisa delas.
const PASTA_FONTES = "node_modules/pdfjs-dist/standard_fonts/";

export type PdfLido = { paginas: number; texto: string; porPagina: string[] };

/** Gera o PDF do CV em Node e lê de volta como um ATS leria (texto extraído). */
export async function gerarELer(cv: CvModel): Promise<PdfLido> {
  const buffer = await renderToBuffer(CvDocument({ cv }));
  const tarefa = getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl: PASTA_FONTES,
  });
  const doc = await tarefa.promise;
  const porPagina: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const pagina = await doc.getPage(n);
    const conteudo = await pagina.getTextContent();
    porPagina.push(
      conteudo.items
        .map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : ""))
        .join(""),
    );
  }
  const paginas = doc.numPages;
  await tarefa.destroy();
  return { paginas, texto: porPagina.join("\n"), porPagina };
}
