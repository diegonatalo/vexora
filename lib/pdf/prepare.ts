import { fitToOnePage } from "@/lib/fit";
import type { FitResult } from "@/types/pdf";
import { buildCv, profileHasNoContent, type CvModel } from "@/lib/pdf/cv-model";
import { generatePdfBytes } from "@/lib/pdf/generate";
import { loadPdfjs } from "@/lib/pdf/pdfjs";
import { readDocument } from "@/lib/pdf/read-document";
import { measurePages } from "@/lib/pdf/measurement";
import type { Measurement } from "@/types/pdf";
import type { LayoutFit } from "@/types/pdf";
import type { Profile } from "@/lib/schema";

export type Prepared = FitResult & { cv: CvModel };

async function measureInBrowser(
  bytes: Uint8Array,
  layoutFit: LayoutFit,
): Promise<Measurement> {
  const pdfjs = await loadPdfjs();

  // O pdfjs entrega o buffer ao worker (e o esvazia): passa uma cópia.
  const task = pdfjs.getDocument({ data: bytes.slice() });
  try {
    const doc = await task.promise;
    const { pages, images } = await readDocument(doc, pdfjs.OPS);
    return measurePages(pages, layoutFit, images);
  } finally {
    void task.destroy();
  }
}

/**
 * Do perfil ao PDF final: monta o CV, escolhe o ajuste que cabe em 1 página
 * e devolve os bytes junto com a medição (usada nas checagens de ATS).
 */
export async function preparePdf(profile: Profile): Promise<Prepared> {
  const cv = buildCv(profile, { placeholders: profileHasNoContent(profile) });
  const result = await fitToOnePage(cv, {
    render: generatePdfBytes,
    measure: measureInBrowser,
  });
  return { ...result, cv };
}
