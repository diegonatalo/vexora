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

  // Sem limite de itens: mostra quantos são e, se houver, quantos estão ocultos.
  const contar = (itens: { exibir?: boolean }[]) => ({
    total: itens.length,
    noCv: itens.filter(estaVisivel).length,
  });
  const exp = contar(p.experiencias);
  const form = contar(p.formacoes);
  const cert = contar(p.certificacoes);
  const rotulo = ({ total, noCv }: { total: number; noCv: number }) => {
    if (total === 0) return "vazio";
    const ocultos = total - noCv;
    if (ocultos === 0) return String(total);
    return `${noCv} · ${ocultos} ${ocultos === 1 ? "oculto" : "ocultos"}`;
  };
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
      concluida: exp.noCv > 0,
      contador: rotulo(exp),
    },
    formacao: {
      concluida: form.noCv > 0,
      contador: rotulo(form),
    },
    certificacoes: {
      concluida: cert.noCv > 0,
      contador: rotulo(cert),
    },
    habilidades: { concluida: temHabilidades },
    links: {
      concluida: preenchido(p.links.linkedin),
      contador: `${nLinks}/3`,
    },
  };
}
