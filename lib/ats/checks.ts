import { COMPATIBLE_FONTS, USED_FONTS } from "@/lib/pdf/fonts";
import { SECTION_TITLES, type CvModel } from "@/lib/pdf/cv-model";
import type { Measurement } from "@/lib/pdf/measurement";
import type { Profile } from "@/lib/schema";
import { suggestTrim } from "@/lib/ats/trim";

export type Check = {
  id: string;
  ok: boolean;
  /** Descrição do que é verificado (mostrada quando está ok). */
  title: string;
  /** Quando falha: o problema em poucas palavras. */
  problem?: string;
  /** Quando falha: como corrigir. */
  fix?: string;
  /** "warning" = recomendação que não impede nada; "error" = precisa corrigir. */
  severity?: "error" | "warning";
};

export type AtsContext = {
  profile: Profile;
  /** O que foi escrito no PDF. */
  cv: CvModel;
  /** O que a medição do PDF gerado encontrou. */
  pdf: Measurement;
  /** Fontes do documento (padrão: as que o CvDocument usa). */
  fonts?: readonly string[];
};

const DATE_MM_YYYY = /^(0[1-9]|1[0-2])\/\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

/** Seções que realmente aparecem no PDF, na ordem do layout. */
function presentSections(cv: CvModel): string[] {
  const sections: [string, boolean][] = [
    [SECTION_TITLES.summary, Boolean(cv.summary)],
    [SECTION_TITLES.experience, cv.experiences.length > 0],
    [SECTION_TITLES.education, cv.educations.length > 0],
    [SECTION_TITLES.certifications, cv.certifications.length > 0],
    [SECTION_TITLES.skills, cv.skills.length > 0],
    [SECTION_TITLES.languages, cv.languages.length > 0],
  ];
  return sections.filter(([, present]) => present).map(([title]) => title);
}

export function checkSelectableText({ cv, pdf }: AtsContext): Check {
  const title = "Texto real e selecionável no PDF";
  const text = normalize(pdf.text);
  const ok = text.length > 0 && text.includes(normalize(cv.name));
  return ok
    ? { id: "selectable-text", ok, title }
    : {
        id: "selectable-text",
        ok,
        title,
        severity: "error",
        problem: "O PDF não tem texto legível.",
        fix: "Gere o PDF de novo; se persistir, recarregue a página.",
      };
}

export function checkSingleColumn({ cv, pdf }: AtsContext): Check {
  const title = "Coluna única, ordem de leitura correta";
  const text = normalize(pdf.text);
  const positions = presentSections(cv)
    .map((t) => text.indexOf(normalize(t)))
    .filter((p) => p >= 0);
  const sorted = positions.every((p, i) => i === 0 || p > positions[i - 1]);
  const firstName =
    text.indexOf(normalize(cv.name)) <= (positions[0] ?? Infinity);
  const ok = sorted && firstName;
  return ok
    ? { id: "single-column", ok, title }
    : {
        id: "single-column",
        ok,
        title,
        severity: "error",
        problem: "A ordem de leitura do PDF está fora do layout.",
        fix: "Gere o PDF de novo com o layout padrão da Vexora.",
      };
}

export function checkStandardTitles({ cv, pdf }: AtsContext): Check {
  const title = "Títulos de seção padrão";
  const text = normalize(pdf.text);
  const missingCount = presentSections(cv).filter(
    (t) => !text.includes(normalize(t)),
  );
  return missingCount.length === 0
    ? { id: "standard-titles", ok: true, title }
    : {
        id: "standard-titles",
        ok: false,
        title,
        severity: "error",
        problem: `Título não encontrado: ${missingCount.join(", ")}.`,
        fix: "Use apenas os títulos padrão da Vexora.",
      };
}

export function checkFont({ fonts = USED_FONTS }: AtsContext): Check {
  const title = "Fonte compatível (Arial)";
  const incompatible = fonts.filter((f) => !COMPATIBLE_FONTS.includes(f));
  return incompatible.length === 0
    ? { id: "font", ok: true, title }
    : {
        id: "font",
        ok: false,
        title,
        severity: "error",
        problem: `Fonte incomum: ${incompatible.join(", ")}.`,
        fix: "Use Helvetica ou Arial.",
      };
}

export function checkNoImages({ pdf }: AtsContext): Check {
  const title = "Sem tabelas, ícones nem imagens";
  return pdf.images === 0
    ? { id: "no-images", ok: true, title }
    : {
        id: "no-images",
        ok: false,
        title,
        severity: "error",
        problem: `O PDF tem ${pdf.images} imagem(ns).`,
        fix: "Remova imagens e ícones: o ATS não lê o que está nelas.",
      };
}

export function checkFitsOnOnePage({ profile, pdf }: AtsContext): Check {
  const title = "Cabe em 1 página";
  if (pdf.pages <= 1) return { id: "one-page", ok: true, title };
  const [first] = suggestTrim(profile);
  return {
    id: "one-page",
    ok: false,
    title,
    severity: "error",
    problem: `O CV passa de 1 página (${pdf.pages}).`,
    fix: first ?? "Enxugue o conteúdo para caber em 1 página.",
  };
}

export function checkStandardDates({ profile }: AtsContext): Check {
  const title = "Datas no padrão MM/AAAA";
  const invalid = (d: string) => !DATE_MM_YYYY.test(d);

  // Itens em branco (recém-adicionados) não entram no PDF, então não contam.
  const invalidExperiences = profile.experiences.filter(
    (e) =>
      (e.jobTitle.trim() || e.company.trim() || e.bullets.some((t) => t.trim())) &&
      (invalid(e.start) || (!e.current && invalid(e.end))),
  );
  const invalidEducations = profile.educations.filter(
    (f) =>
      (f.course.trim() || f.institution.trim()) &&
      (invalid(f.start) || (!f.current && invalid(f.end))),
  );
  if (invalidExperiences.length + invalidEducations.length === 0) {
    return { id: "dates", ok: true, title };
  }
  const where =
    invalidExperiences.length > 0 && invalidEducations.length > 0
      ? "nas experiências e na formação"
      : invalidExperiences.length > 0
        ? "em todas as experiências"
        : "em todas as formações";
  return {
    id: "dates",
    ok: false,
    title,
    severity: "error",
    problem: "Datas fora do padrão.",
    fix: `Use MM/AAAA ${where}.`,
  };
}

export function checkContact({ profile }: AtsContext): Check {
  const title = "Contato completo";
  const missing = [
    EMAIL.test(profile.email.trim()) ? null : "e-mail",
    profile.phone.trim() ? null : "telefone",
  ].filter((x): x is string => x !== null);

  if (missing.length > 0) {
    return {
      id: "contact",
      ok: false,
      title,
      severity: "error",
      problem: `Falta ${missing.join(" e ")}.`,
      fix: "Preencha em Dados pessoais: o ATS e o recrutador precisam.",
    };
  }
  if (!profile.links.linkedin.trim()) {
    return {
      id: "contact",
      ok: false,
      title,
      severity: "warning",
      problem: "Sem link do LinkedIn.",
      fix: "Adicione em Links e portfólio.",
    };
  }
  return { id: "contact", ok: true, title };
}

/** As 8 checagens, na ordem de exibição. */
export function runChecks(ctx: AtsContext): Check[] {
  return [
    checkSelectableText(ctx),
    checkSingleColumn(ctx),
    checkStandardTitles(ctx),
    checkFont(ctx),
    checkNoImages(ctx),
    checkFitsOnOnePage(ctx),
    checkStandardDates(ctx),
    checkContact(ctx),
  ];
}
