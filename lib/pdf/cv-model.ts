import { onlyVisible } from "@/lib/visibility";
import type { Profile } from "@/lib/schema";

/** Títulos fixos de seção (a checagem de ATS na Fase 4 usa esta lista). */
export const SECTION_TITLES = {
  summary: "Resumo profissional",
  experience: "Experiência profissional",
  education: "Formação acadêmica",
  certifications: "Certificações",
  skills: "Habilidades",
  languages: "Idiomas",
} as const;

/** `href` torna o item clicável no PDF (https:, mailto: ou tel:). */
export type ContactItem = { text: string; href?: string };

export type CvModel = {
  name: string;
  jobTitle: string;
  /** Itens da linha de contato; o documento os junta com " · ". */
  contact: ContactItem[];
  summary: string;
  experiences: { title: string; period: string; bullets: string[] }[];
  educations: { course: string; institution: string; period: string }[];
  certifications: string[];
  skills: { label: string; items: string }[];
  languages: string[];
};

export type CvOptions = {
  /**
   * Preenche com `[placeholders]` o que está vazio (pré-visualização do design).
   * O PDF baixado não usa: seções sem conteúdo são omitidas.
   */
  placeholders?: boolean;
};

const EMPTY_PERIOD = "MM/AAAA – MM/AAAA";

/** Perfil sem nada preenchido: a pré-visualização mostra o modelo com [placeholders]. */
export function profileHasNoContent(p: Profile): boolean {
  return (
    !p.fullName.trim() &&
    !p.desiredJobTitle.trim() &&
    !p.summary.trim() &&
    p.experiences.length === 0 &&
    p.educations.length === 0 &&
    p.certifications.length === 0 &&
    p.languages.length === 0 &&
    p.skills.length === 0
  );
}

/** Endereço clicável de um link do perfil (garante o esquema https://). */
export function linkHref(url: string): string | undefined {
  const text = url.trim();
  if (text === "") return undefined;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

export function emailHref(email: string): string | undefined {
  const text = email.trim();
  return text === "" ? undefined : `mailto:${text}`;
}

/** "(11) 98765-4321" -> "tel:+5511987654321" (DDD + número; assume Brasil). */
export function phoneHref(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11)
    return `tel:+55${digits}`;
  if (digits.startsWith("55") && digits.length >= 12)
    return `tel:+${digits}`;
  return undefined;
}

export function linkCurto(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function formatPeriod(
  start: string,
  end: string,
  current: boolean,
): string {
  const finalValue = current ? "Atual" : end;
  if (start && finalValue) return `${start} – ${finalValue}`;
  return start || finalValue;
}

const clear = (v: string | undefined) => (v ?? "").trim();
const join = (parts: string[], sep: string) =>
  parts.filter(Boolean).join(sep);

export function buildCv(
  completeProfile: Profile,
  options: CvOptions = {},
): CvModel {
  const profile = onlyVisible(completeProfile);
  const ph = options.placeholders ?? false;
  const or = (value: string, placeholder: string) =>
    value || (ph ? placeholder : "");

  const experiences = profile.experiences
    .map((e) => {
      const jobTitle = clear(e.jobTitle);
      const company = clear(e.company);
      const bullets = e.bullets.map(clear).filter(Boolean);
      const period = formatPeriod(clear(e.start), clear(e.end), e.current);
      const empty = !jobTitle && !company && bullets.length === 0 && !period;
      if (empty) return null;
      const jobTitleName = or(jobTitle, "[Cargo]");
      const companyName = or(company, "[Empresa]");
      return {
        title: join(
          [join([jobTitleName, companyName], " — "), clear(e.cityState)],
          ", ",
        ),
        period: or(period, EMPTY_PERIOD),
        bullets:
          bullets.length === 0 && ph
            ? ["[Verbo de ação] + [o que você fez] + [resultado ou métrica]"]
            : bullets,
      };
    })
    .filter((e) => e !== null);

  const educations = profile.educations
    .map((f) => ({
      course: clear(f.course),
      institution: clear(f.institution),
      period: formatPeriod(clear(f.start), clear(f.end), f.current),
    }))
    .filter((f) => f.course || f.institution || f.period);

  const certifications = profile.certifications
    .map((c) =>
      join(
        [join([clear(c.name), clear(c.institution)], " — "), clear(c.year)],
        ", ",
      ),
    )
    .filter(Boolean);

  const skills = profile.skills
    .map((g) => ({
      label: clear(g.title) ? `${clear(g.title)}:` : "",
      items: g.items.join(", "),
    }))
    .filter((h) => h.items);

  const languages = profile.languages
    .map((i) => join([clear(i.language), clear(i.level)], " — "))
    .filter(Boolean);

  const contact: ContactItem[] = [
    { text: clear(profile.cityState) },
    { text: clear(profile.phone), href: phoneHref(profile.phone) },
    { text: clear(profile.email), href: emailHref(profile.email) },
    ...(["linkedin", "github", "portfolio"] as const).map((key) => ({
      text: linkCurto(profile.links[key]),
      href: linkHref(profile.links[key]),
    })),
  ].filter((i) => i.text !== "");

  return {
    name: or(clear(profile.fullName), "[Seu Nome Completo]"),
    jobTitle: or(clear(profile.desiredJobTitle), "[Cargo desejado]"),
    contact:
      contact.length === 0 && ph
        ? [
            "[Cidade, UF]",
            "[(00) 00000-0000]",
            "[email@dominio.com]",
            "[linkedin.com/in/usuario]",
          ].map((text) => ({ text }))
        : contact,
    summary: or(
      clear(profile.summary),
      "[2 a 3 linhas: quem você é, sua área, anos de experiência ou formação e as tecnologias ou competências que mais importam para a vaga.]",
    ),
    experiences:
      experiences.length === 0 && ph
        ? [
            {
              title: "[Cargo] — [Empresa], [Cidade/UF]",
              period: EMPTY_PERIOD,
              bullets: [
                "[Verbo de ação] + [o que você fez] + [resultado ou métrica]",
              ],
            },
          ]
        : experiences,
    educations:
      educations.length === 0 && ph
        ? [
            {
              course: "[Curso]",
              institution: "[Instituição]",
              period: EMPTY_PERIOD,
            },
          ]
        : educations,
    certifications:
      certifications.length === 0 && ph
        ? ["[Nome da certificação] — [Instituição], AAAA"]
        : certifications,
    skills:
      skills.length === 0 && ph
        ? [
            {
              label: "[Grupo de habilidades]:",
              items: "[Habilidade 1], [Habilidade 2], [Habilidade 3]",
            },
          ]
        : skills,
    languages: languages.length === 0 && ph ? ["[Idioma] — [nível]"] : languages,
  };
}
