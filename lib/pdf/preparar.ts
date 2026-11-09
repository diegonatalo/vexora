import { ajustarParaUmaPagina, type ResultadoFit } from "@/lib/fit";
import { montarCv, perfilSemConteudo, type CvModel } from "@/lib/pdf/cv-model";
import { gerarPdfBytes } from "@/lib/pdf/gerar";
import { carregarPdfjs } from "@/lib/pdf/pdfjs";
import { lerDocumento } from "@/lib/pdf/ler-documento";
import { medirPaginas, type Medicao } from "@/lib/pdf/medicao";
import type { Ajuste } from "@/lib/fit";
import type { Perfil } from "@/lib/schema";

export type Preparado = ResultadoFit & { cv: CvModel };

async function medirNoNavegador(
  bytes: Uint8Array,
  ajuste: Ajuste,
): Promise<Medicao> {
  const pdfjs = await carregarPdfjs();

  // O pdfjs entrega o buffer ao worker (e o esvazia): passa uma cópia.
  const tarefa = pdfjs.getDocument({ data: bytes.slice() });
  try {
    const doc = await tarefa.promise;
    const { paginas, imagens } = await lerDocumento(doc, pdfjs.OPS);
    return medirPaginas(paginas, ajuste, imagens);
  } finally {
    void tarefa.destroy();
  }
}

/**
 * Do perfil ao PDF final: monta o CV, escolhe o ajuste que cabe em 1 página
 * e devolve os bytes junto com a medição (usada nas checagens de ATS).
 */
export async function prepararPdf(perfil: Perfil): Promise<Preparado> {
  const cv = montarCv(perfil, { placeholders: perfilSemConteudo(perfil) });
  const resultado = await ajustarParaUmaPagina(cv, {
    renderizar: gerarPdfBytes,
    medir: medirNoNavegador,
  });
  return { ...resultado, cv };
}
