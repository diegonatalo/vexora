import { LIMITES, type Perfil } from "@/lib/schema";

export const SECOES = [
  { id: "dados", titulo: "Dados pessoais" },
  { id: "resumo", titulo: "Resumo" },
  { id: "experiencia", titulo: "Experiência" },
  { id: "formacao", titulo: "Formação" },
  { id: "certificacoes", titulo: "Certificações" },
  { id: "habilidades", titulo: "Habilidades" },
  { id: "links", titulo: "Links e portfólio" },
] as const;

export type SecaoId = (typeof SECOES)[number]["id"];

export type StatusSecao = {
  concluida: boolean;
  /** Texto à direita do item na navegação (ex.: "3/3" ou "vazio"). */
  contador?: string;
};

const preenchido = (v: string) => v.trim() !== "";

const EMAIL_SIMPLES = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function statusDasSecoes(p: Perfil): Record<SecaoId, StatusSecao> {
  const dadosCompletos =
    preenchido(p.nomeCompleto) &&
    preenchido(p.cargoDesejado) &&
    preenchido(p.cidadeUf) &&
    preenchido(p.telefone) &&
    EMAIL_SIMPLES.test(p.email);

  const nExp = p.experiencias.length;
  const nFor = p.formacoes.length;
  const nCert = p.certificacoes.length;
  const nLinks = Object.values(p.links).filter(preenchido).length;
  const temHabilidades =
    p.habilidades.linguagens.length +
      p.habilidades.frameworks.length +
      p.habilidades.ferramentas.length >
    0;

  return {
    dados: { concluida: dadosCompletos },
    resumo: { concluida: preenchido(p.resumo) },
    experiencia: {
      concluida: nExp > 0,
      contador: nExp > 0 ? `${nExp}/${LIMITES.experiencias}` : "vazio",
    },
    formacao: {
      concluida: nFor > 0,
      contador: nFor > 0 ? `${nFor}/${LIMITES.formacoes}` : "vazio",
    },
    certificacoes: {
      concluida: nCert > 0,
      contador: nCert > 0 ? `${nCert}/${LIMITES.certificacoes}` : "vazio",
    },
    habilidades: { concluida: temHabilidades },
    links: {
      concluida: preenchido(p.links.linkedin),
      contador: `${nLinks}/3`,
    },
  };
}
