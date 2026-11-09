import type { Ajuste } from "@/lib/fit";
import type { CvModel } from "@/lib/pdf/cv-model";

/**
 * Gera o PDF no navegador. As bibliotecas (react-pdf) são importadas sob
 * demanda para não entrar no bundle inicial nem rodar no servidor.
 */
export async function gerarPdfBytes(
  cv: CvModel,
  ajuste?: Ajuste,
): Promise<Uint8Array> {
  const [{ pdf }, { CvDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/cv-document"),
  ]);
  const blob = await pdf(CvDocument({ cv, ajuste })).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}

export function nomeDoArquivo(nome: string): string {
  const slug = nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cv-${slug || "vexora"}.pdf`;
}
