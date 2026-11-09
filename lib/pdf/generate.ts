import type { LayoutFit } from "@/types/pdf";
import type { CvModel } from "@/lib/pdf/cv-model";

/**
 * Gera o PDF no navegador. As bibliotecas (react-pdf) são importadas sob
 * demanda para não entrar no bundle inicial nem rodar no servidor.
 */
export async function generatePdfBytes(
  cv: CvModel,
  layoutFit?: LayoutFit,
): Promise<Uint8Array> {
  const [{ pdf }, { CvDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/cv-document"),
  ]);
  const blob = await pdf(CvDocument({ cv, layoutFit })).toBlob();
  return new Uint8Array(await blob.arrayBuffer());
}

export function fileName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `cv-${slug || "vexora"}.pdf`;
}
