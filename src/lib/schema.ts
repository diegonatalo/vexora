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
export const LIMITES = {
  topicosPorExperiencia: 3,
  caracteresPorTopico: 110,
} as const;

/** `undefined` conta como exibido (dados salvos antes deste campo existir). */
const exibir = z.boolean().optional();

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
    exibir,
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
    exibir,
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
  exibir,
});

export const idiomaSchema = z.object({
  idioma: z.string().trim().max(40),
  nivel: z.string().trim().max(40),
  exibir,
});

/**
 * Habilidades são grupos livres: a pessoa dá o nome ("Técnicas", "Ferramentas",
 * "Atendimento"…) e lista os itens. Serve para qualquer profissão.
 */
export const grupoHabilidadesSchema = z.object({
  titulo: z.string().trim().max(60),
  itens: z.array(z.string().trim().min(1)),
  exibir,
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
  experiencias: z.array(experienciaSchema),
  formacoes: z.array(formacaoSchema),
  certificacoes: z.array(certificacaoSchema),
  habilidades: z.array(grupoHabilidadesSchema),
  idiomas: z.array(idiomaSchema),
});

/** Arquivo de exportação/importação. `formato` permite migrar no futuro. */
export const backupSchema = z.object({
  formato: z.literal(1),
  exportadoEm: z.string(),
  perfil: perfilSchema,
});

export type Perfil = z.infer<typeof perfilSchema>;
export type Experiencia = z.infer<typeof experienciaSchema>;
export type Formacao = z.infer<typeof formacaoSchema>;
export type Certificacao = z.infer<typeof certificacaoSchema>;
export type Idioma = z.infer<typeof idiomaSchema>;
export type GrupoHabilidades = z.infer<typeof grupoHabilidadesSchema>;
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
    exibir: true,
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
    habilidades: [],
    idiomas: [],
  };
}
