import { z } from "zod";

/**
 * Fonte da verdade dos tipos da Vexora.
 *
 * Campos de texto aceitam "" porque o perfil é salvo enquanto a pessoa ainda
 * está preenchendo; a completude (e-mail, telefone, datas) é cobrada pelas
 * checagens de ATS, não pelo schema. O que for preenchido precisa ser válido.
 */

/**
 * Só os tópicos têm limite (3 por experiência, 110 caracteres cada). A
 * quantidade de experiências, formações, certificações e idiomas é livre: o
 * ajuste para 1 página e o "Exibir no CV" controlam o que entra no PDF.
 */
export const LIMITS = {
  bulletsPerExperience: 3,
  charactersPerBullet: 110,
} as const;

/** `undefined` conta como exibido (dados salvos antes deste campo existir). */
const visible = z.boolean().optional();

const DATE_MM_YYYY = /^(0[1-9]|1[0-2])\/\d{4}$/;

/** Converte "MM/AAAA" em número comparável (meses desde o ano 0). */
export function monthsOf(data: string): number {
  const [month, year] = data.split("/").map(Number);
  return year * 12 + month;
}

const monthYearDate = z.string().refine((v) => v === "" || DATE_MM_YYYY.test(v), {
  message: "Use o formato MM/AAAA, por exemplo 03/2022.",
});

const optionalUrl = z.union([
  z.literal(""),
  z.url({ message: "Informe uma URL válida." }),
]);

/** Valida datas de início/fim: se `atual`, ignora o fim; senão exige início <= fim. */
function validatePeriod(
  v: { start: string; end: string; current: boolean },
  ctx: z.RefinementCtx,
) {
  if (!v.current && v.start && v.end && monthsOf(v.start) > monthsOf(v.end)) {
    ctx.addIssue({
      code: "custom",
      path: ["fim"],
      message: "A data de fim não pode ser anterior à de início.",
    });
  }
}

export const experienceSchema = z
  .object({
    id: z.string().min(1),
    jobTitle: z.string().trim().max(80),
    company: z.string().trim().max(80),
    cityState: z.string().trim().max(60).optional(),
    start: monthYearDate,
    end: monthYearDate,
    current: z.boolean(),
    visible,
    bullets: z
      .array(
        z.string().max(LIMITS.charactersPerBullet, {
          message: `Use no máximo ${LIMITS.charactersPerBullet} caracteres.`,
        }),
      )
      .max(LIMITS.bulletsPerExperience),
  })
  .superRefine(validatePeriod);

export const educationSchema = z
  .object({
    id: z.string().min(1),
    course: z.string().trim().max(100),
    institution: z.string().trim().max(100),
    start: monthYearDate,
    end: monthYearDate,
    /** "Cursando": o fim é exibido como "Atual". */
    current: z.boolean(),
    visible,
  })
  .superRefine(validatePeriod);

export const certificationSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().max(100),
  institution: z.string().trim().max(100),
  year: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}$/, { message: "Use um ano com 4 dígitos." }),
  ]),
  visible,
});

export const languageSchema = z.object({
  language: z.string().trim().max(40),
  level: z.string().trim().max(40),
  visible,
});

/**
 * Habilidades são grupos livres: a pessoa dá o nome ("Técnicas", "Ferramentas",
 * "Atendimento"…) e lista os itens. Serve para qualquer profissão.
 */
export const skillGroupSchema = z.object({
  title: z.string().trim().max(60),
  items: z.array(z.string().trim().min(1)),
  visible,
});

export const profileSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().max(100),
  desiredJobTitle: z.string().trim().max(100),
  cityState: z.string().trim().max(60),
  phone: z.string().trim().max(30),
  email: z.union([
    z.literal(""),
    z.email({ message: "Informe um e-mail válido." }),
  ]),
  links: z.object({
    linkedin: optionalUrl,
    github: optionalUrl,
    portfolio: optionalUrl,
  }),
  summary: z.string().max(500),
  experiences: z.array(experienceSchema),
  educations: z.array(educationSchema),
  certifications: z.array(certificationSchema),
  skills: z.array(skillGroupSchema),
  languages: z.array(languageSchema),
});

/** Arquivo de exportação/importação. `formato` permite migrar no futuro. */
export const backupSchema = z.object({
  format: z.literal(1),
  exportedAt: z.string(),
  profile: profileSchema,
});

export type Profile = z.infer<typeof profileSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Language = z.infer<typeof languageSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Backup = z.infer<typeof backupSchema>;

export function newId(): string {
  return crypto.randomUUID();
}

export function createEmptyExperience(): Experience {
  return {
    id: newId(),
    jobTitle: "",
    company: "",
    start: "",
    end: "",
    current: false,
    visible: true,
    bullets: ["", "", ""],
  };
}

export function createEmptyProfile(): Profile {
  return {
    id: newId(),
    fullName: "",
    desiredJobTitle: "",
    cityState: "",
    phone: "",
    email: "",
    links: { linkedin: "", github: "", portfolio: "" },
    summary: "",
    experiences: [],
    educations: [],
    certifications: [],
    skills: [],
    languages: [],
  };
}
