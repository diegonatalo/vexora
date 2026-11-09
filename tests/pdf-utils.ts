import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument, OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ajustarParaUmaPagina, NIVEIS, type Ajuste } from "@/lib/fit";
import type { CvModel } from "@/lib/pdf/cv-model";
import { lerDocumento } from "@/lib/pdf/ler-documento";
import { medirPaginas, type Medicao } from "@/lib/pdf/medicao";
import { CvDocument } from "@/components/pdf/cv-document";

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

/** Links clicáveis do PDF (anotações do tipo Link), como um leitor os veria. */
export async function lerLinks(
  bytes: Uint8Array,
): Promise<{ url: string; largura: number }[]> {
  const tarefa = getDocument({
    data: bytes.slice(),
    standardFontDataUrl: PASTA_FONTES,
  });
  try {
    const doc = await tarefa.promise;
    const links: { url: string; largura: number }[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const pagina = await doc.getPage(n);
      for (const a of await pagina.getAnnotations()) {
        if (a.subtype === "Link" && a.url) {
          links.push({ url: a.url, largura: a.rect[2] - a.rect[0] });
        }
      }
    }
    return links;
  } finally {
    await tarefa.destroy();
  }
}
