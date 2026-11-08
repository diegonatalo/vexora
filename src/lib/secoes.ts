import type { Perfil } from "@/lib/schema";
import { estaVisivel } from "@/lib/visiveis";

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

  const nExp = p.experiencias.filter(estaVisivel).length;
  const nFor = p.formacoes.filter(estaVisivel).length;
  const nCert = p.certificacoes.filter(estaVisivel).length;
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
    },
    formacao: {
      concluida: nFor > 0,
    },
    certificacoes: {
      concluida: nCert > 0,
    },
    habilidades: { concluida: temHabilidades },
    links: {
      concluida: preenchido(p.links.linkedin),
    },
  };
}
