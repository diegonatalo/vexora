import { z } from "zod";

/**
 * Fonte da verdade dos tipos da Folha.
 *
 * Campos de texto aceitam "" porque o perfil é salvo enquanto a pessoa ainda
 * está preenchendo; a completude (e-mail, telefone, datas) é cobrada pelas
 * checagens de ATS, não pelo schema. O que for preenchido precisa ser válido.
 */

export const LIMITES = {
  experiencias: 3,
  formacoes: 3,
  certificacoes: 4,
  topicosPorExperiencia: 3,
  caracteresPorTopico: 110,
  idiomas: 4,
} as const;

const DATA_MM_AAAA = /^(0[1-9]|1[0-2])\/\d{4}$/;

/** Converte "MM/AAAA" em número comparável (meses desde o ano 0). */
export function mesesDe(data: string): number {
  const [mes, ano] = data.split("/").map(Number);
  return ano * 12 + mes;
}

const dataMesAno = z.string().refine((v) => v === "" || DATA_MM_AAAA.test(v), {
  message: "Use o formato MM/AAAA, por exemplo 03/2022.",
});

const urlOpcional = z.union([
  z.literal(""),
  z.url({ message: "Informe uma URL válida." }),
]);

/** Valida datas de início/fim: se `atual`, ignora o fim; senão exige início <= fim. */
function validarPeriodo(
  v: { inicio: string; fim: string; atual: boolean },
  ctx: z.RefinementCtx,
) {
  if (!v.atual && v.inicio && v.fim && mesesDe(v.inicio) > mesesDe(v.fim)) {
    ctx.addIssue({
      code: "custom",
      path: ["fim"],
      message: "A data de fim não pode ser anterior à de início.",
    });
  }
}

export const experienciaSchema = z
  .object({
    id: z.string().min(1),
    cargo: z.string().trim().max(80),
    empresa: z.string().trim().max(80),
    cidadeUf: z.string().trim().max(60).optional(),
    inicio: dataMesAno,
    fim: dataMesAno,
    atual: z.boolean(),
    topicos: z
      .array(
        z.string().max(LIMITES.caracteresPorTopico, {
          message: `Use no máximo ${LIMITES.caracteresPorTopico} caracteres.`,
        }),
      )
      .max(LIMITES.topicosPorExperiencia),
  })
  .superRefine(validarPeriodo);

export const formacaoSchema = z
  .object({
    id: z.string().min(1),
    curso: z.string().trim().max(100),
    instituicao: z.string().trim().max(100),
    inicio: dataMesAno,
    fim: dataMesAno,
    /** "Cursando": o fim é exibido como "Atual". */
    atual: z.boolean(),
  })
  .superRefine(validarPeriodo);

export const certificacaoSchema = z.object({
  id: z.string().min(1),
  nome: z.string().trim().max(100),
  instituicao: z.string().trim().max(100),
  ano: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}$/, { message: "Use um ano com 4 dígitos." }),
  ]),
});

export const idiomaSchema = z.object({
  idioma: z.string().trim().max(40),
  nivel: z.string().trim().max(40),
});

export const habilidadesSchema = z.object({
  linguagens: z.array(z.string().trim().min(1)),
  frameworks: z.array(z.string().trim().min(1)),
  ferramentas: z.array(z.string().trim().min(1)),
});

export const perfilSchema = z.object({
  id: z.string().min(1),
  nomeCompleto: z.string().trim().max(100),
  cargoDesejado: z.string().trim().max(100),
  cidadeUf: z.string().trim().max(60),
  telefone: z.string().trim().max(30),
  email: z.union([
    z.literal(""),
    z.email({ message: "Informe um e-mail válido." }),
  ]),
  links: z.object({
    linkedin: urlOpcional,
    github: urlOpcional,
    portfolio: urlOpcional,
  }),
  resumo: z.string().max(500),
  experiencias: z.array(experienciaSchema).max(LIMITES.experiencias),
  formacoes: z.array(formacaoSchema).max(LIMITES.formacoes),
  certificacoes: z.array(certificacaoSchema).max(LIMITES.certificacoes),
  habilidades: habilidadesSchema,
  idiomas: z.array(idiomaSchema).max(LIMITES.idiomas),
});

export const ajustesSchema = z.object({
  /** Ordem personalizada das habilidades (só reordena, nunca acrescenta). */
  ordemHabilidades: habilidadesSchema.partial().default({}),
  /** Tópicos a priorizar, por experiência (índices na lista de tópicos). */
  topicosEmDestaque: z
    .array(
      z.object({
        experienciaId: z.string(),
        indices: z.array(z.number().int().min(0)),
      }),
    )
    .default([]),
  certificacoesOcultas: z.array(z.string()).default([]),
  resumoAlternativo: z.string().max(500).optional(),
});

export const vagaSchema = z.object({
  titulo: z.string().trim(),
  empresa: z.string().trim().default(""),
  descricao: z.string(),
});

export const versaoCvSchema = z.object({
  id: z.string().min(1),
  nome: z.string().trim().min(1).max(80),
  perfilId: z.string().min(1),
  vaga: vagaSchema.optional(),
  ajustes: ajustesSchema,
});

/** Arquivo de exportação/importação. `formato` permite migrar no futuro. */
export const backupSchema = z.object({
  formato: z.literal(1),
  exportadoEm: z.string(),
  perfil: perfilSchema,
  versoes: z.array(versaoCvSchema),
});

export type Perfil = z.infer<typeof perfilSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Formacao = z.infer<typeof formacaoSchema>;
export type Certificacao = z.infer<typeof certificacaoSchema>;
export type Idioma = z.infer<typeof idiomaSchema>;
export type Habilidades = z.infer<typeof habilidadesSchema>;
export type VersaoCv = z.infer<typeof versaoCvSchema>;
export type Backup = z.infer<typeof backupSchema>;

export function novoId(): string {
  return crypto.randomUUID();
}

export function criarExperienciaVazia(): Experiencia {
  return {
    id: novoId(),
    cargo: "",
    empresa: "",
    inicio: "",
    fim: "",
    atual: false,
    topicos: ["", "", ""],
  };
}

export function criarPerfilVazio(): Perfil {
  return {
    id: novoId(),
    nomeCompleto: "",
    cargoDesejado: "",
    cidadeUf: "",
    telefone: "",
    email: "",
    links: { linkedin: "", github: "", portfolio: "" },
    resumo: "",
    experiencias: [],
    formacoes: [],
    certificacoes: [],
    habilidades: { linguagens: [], frameworks: [], ferramentas: [] },
    idiomas: [],
  };
}

export function criarVersaoPadrao(perfil: Perfil): VersaoCv {
  return {
    id: novoId(),
    nome: "CV geral",
    perfilId: perfil.id,
    ajustes: ajustesSchema.parse({}),
  };
}
