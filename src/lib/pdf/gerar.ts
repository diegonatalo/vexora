import type { CvModel } from "@/lib/pdf/cv-model";

/**
 * Gera o PDF no navegador. As bibliotecas (react-pdf) são importadas sob
 * demanda para não entrar no bundle inicial nem rodar no servidor.
 */
export async function gerarPdfBlob(cv: CvModel): Promise<Blob> {
  const [{ pdf }, { CvDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/pdf/CvDocument"),
  ]);
  return pdf(CvDocument({ cv })).toBlob();
}

export function nomeDoArquivo(nome: string): string {
  const slug = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cv-${slug || "folha"}.pdf`;
}
