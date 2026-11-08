import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ajustarParaUmaPagina, NIVEIS, type Ajuste } from "@/lib/fit";
import type { CvModel } from "@/lib/pdf/cv-model";
import { lerDocumento } from "@/lib/pdf/ler-documento";
import { medirPaginas, type Medicao } from "@/lib/pdf/medicao";
import { CvDocument } from "@/pdf/CvDocument";

// Fontes padrão do PDF (Helvetica não é embutida): só o pdfjs precisa delas.
const PASTA_FONTES = "node_modules/pdfjs-dist/standard_fonts/";

export async function renderizarEmNode(
  cv: CvModel,
  ajuste: Ajuste = NIVEIS[0],
): Promise<Uint8Array> {
  return new Uint8Array(await renderToBuffer(CvDocument({ cv, ajuste })));
}

/** Lê o PDF como um ATS leria: texto extraído, páginas, posições e imagens. */
export async function medirEmNode(
  bytes: Uint8Array,
  ajuste: Ajuste = NIVEIS[0],
): Promise<Medicao> {
  const tarefa = getDocument({
    data: bytes.slice(),
    standardFontDataUrl: PASTA_FONTES,
  });
  try {
    const doc = await tarefa.promise;
    const { paginas, imagens } = await lerDocumento(doc, OPS);
    return medirPaginas(paginas, ajuste, imagens);
  } finally {
    await tarefa.destroy();
  }
}

/** Gera o PDF em um nível de ajuste (padrão: o layout base) e o mede. */
export async function gerarELer(cv: CvModel, ajuste: Ajuste = NIVEIS[0]) {
  const bytes = await renderizarEmNode(cv, ajuste);
  return { bytes, ...(await medirEmNode(bytes, ajuste)) };
}

/** O fluxo completo do app (ajuste até caber), em Node. */
export function ajustarEmNode(cv: CvModel) {
  return ajustarParaUmaPagina(cv, {
    renderizar: renderizarEmNode,
    medir: medirEmNode,
  });
}
