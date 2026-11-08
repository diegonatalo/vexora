import type { Perfil } from "@/lib/schema";

/** Títulos fixos de seção (a checagem de ATS na Fase 4 usa esta lista). */
export const TITULOS_SECAO = {
  resumo: "Resumo profissional",
  experiencia: "Experiência profissional",
  formacao: "Formação acadêmica",
  certificacoes: "Certificações",
  habilidades: "Habilidades técnicas",
  idiomas: "Idiomas",
} as const;

export const ROTULOS_HABILIDADES = {
  linguagens: "Linguagens",
  frameworks: "Frameworks e bibliotecas",
  ferramentas: "Ferramentas",
} as const;

export type CvModel = {
  nome: string;
  cargo: string;
  /** Itens da linha de contato; o documento os junta com " · ". */
  contato: string[];
  resumo: string;
  experiencias: { titulo: string; periodo: string; topicos: string[] }[];
  formacoes: { curso: string; instituicao: string; periodo: string }[];
  certificacoes: string[];
  habilidades: { rotulo: string; itens: string }[];
  idiomas: string[];
};

export type OpcoesCv = {
  /**
   * Preenche com `[placeholders]` o que está vazio (pré-visualização do design).
   * O PDF baixado não usa: seções sem conteúdo são omitidas.
   */
  placeholders?: boolean;
};

const PERIODO_VAZIO = "MM/AAAA – MM/AAAA";

/** Perfil sem nada preenchido: a pré-visualização mostra o modelo com [placeholders]. */
export function perfilSemConteudo(p: Perfil): boolean {
  return (
    !p.nomeCompleto.trim() &&
    !p.cargoDesejado.trim() &&
    !p.resumo.trim() &&
    p.experiencias.length === 0 &&
    p.formacoes.length === 0 &&
    p.certificacoes.length === 0 &&
    p.idiomas.length === 0 &&
    Object.values(p.habilidades).every((l) => l.length === 0)
  );
}

export function linkCurto(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function formatarPeriodo(
  inicio: string,
  fim: string,
  atual: boolean,
): string {
  const final = atual ? "Atual" : fim;
  if (inicio && final) return `${inicio} – ${final}`;
  return inicio || final;
}

const limpar = (v: string | undefined) => (v ?? "").trim();
const juntar = (partes: string[], sep: string) =>
  partes.filter(Boolean).join(sep);

export function montarCv(perfil: Perfil, opcoes: OpcoesCv = {}): CvModel {
  const ph = opcoes.placeholders ?? false;
  const ou = (valor: string, placeholder: string) =>
    valor || (ph ? placeholder : "");

  const experiencias = perfil.experiencias
    .map((e) => {
      const cargo = limpar(e.cargo);
      const empresa = limpar(e.empresa);
      const topicos = e.topicos.map(limpar).filter(Boolean);
      const periodo = formatarPeriodo(limpar(e.inicio), limpar(e.fim), e.atual);
      const vazia = !cargo && !empresa && topicos.length === 0 && !periodo;
      if (vazia) return null;
      const nomeCargo = ou(cargo, "[Cargo]");
      const nomeEmpresa = ou(empresa, "[Empresa]");
      return {
        titulo: juntar(
          [juntar([nomeCargo, nomeEmpresa], " — "), limpar(e.cidadeUf)],
          ", ",
        ),
        periodo: ou(periodo, PERIODO_VAZIO),
        topicos:
          topicos.length === 0 && ph
            ? ["[Verbo de ação] + [o que você fez] + [resultado ou métrica]"]
            : topicos,
      };
    })
    .filter((e) => e !== null);

  const formacoes = perfil.formacoes
    .map((f) => ({
      curso: limpar(f.curso),
      instituicao: limpar(f.instituicao),
      periodo: formatarPeriodo(limpar(f.inicio), limpar(f.fim), f.atual),
    }))
    .filter((f) => f.curso || f.instituicao || f.periodo);

  const certificacoes = perfil.certificacoes
    .map((c) =>
      juntar(
        [juntar([limpar(c.nome), limpar(c.instituicao)], " — "), limpar(c.ano)],
        ", ",
      ),
    )
    .filter(Boolean);

  const habilidades = (
    Object.keys(ROTULOS_HABILIDADES) as (keyof typeof ROTULOS_HABILIDADES)[]
  )
    .map((chave) => ({
      rotulo: `${ROTULOS_HABILIDADES[chave]}:`,
      itens: perfil.habilidades[chave].join(", "),
    }))
    .filter((h) => h.itens);

  const idiomas = perfil.idiomas
    .map((i) => juntar([limpar(i.idioma), limpar(i.nivel)], " — "))
    .filter(Boolean);

  const contato = [
    limpar(perfil.cidadeUf),
    limpar(perfil.telefone),
    limpar(perfil.email),
    linkCurto(perfil.links.linkedin),
    linkCurto(perfil.links.github),
    linkCurto(perfil.links.portfolio),
  ].filter(Boolean);

  return {
    nome: ou(limpar(perfil.nomeCompleto), "[Seu Nome Completo]"),
    cargo: ou(limpar(perfil.cargoDesejado), "[Cargo desejado]"),
    contato:
      contato.length === 0 && ph
        ? [
            "[Cidade, UF]",
            "[(00) 00000-0000]",
            "[email@dominio.com]",
            "[linkedin.com/in/usuario]",
          ]
        : contato,
    resumo: ou(
      limpar(perfil.resumo),
      "[2 a 3 linhas: quem você é, sua área, anos de experiência ou formação e as tecnologias ou competências que mais importam para a vaga.]",
    ),
    experiencias:
      experiencias.length === 0 && ph
        ? [
            {
              titulo: "[Cargo] — [Empresa], [Cidade/UF]",
              periodo: PERIODO_VAZIO,
              topicos: [
                "[Verbo de ação] + [o que você fez] + [resultado ou métrica]",
              ],
            },
          ]
        : experiencias,
    formacoes:
      formacoes.length === 0 && ph
        ? [
            {
              curso: "[Curso]",
              instituicao: "[Instituição]",
              periodo: PERIODO_VAZIO,
            },
          ]
        : formacoes,
    certificacoes:
      certificacoes.length === 0 && ph
        ? ["[Nome da certificação] — [Instituição], AAAA"]
        : certificacoes,
    habilidades:
      habilidades.length === 0 && ph
        ? [
            {
              rotulo: "Linguagens:",
              itens: "[Tecnologia 1], [Tecnologia 2], [Tecnologia 3]",
            },
            {
              rotulo: "Frameworks e bibliotecas:",
              itens: "[Tecnologia 1], [Tecnologia 2], [Tecnologia 3]",
            },
            {
              rotulo: "Ferramentas:",
              itens: "[Ferramenta 1], [Ferramenta 2], [Ferramenta 3]",
            },
          ]
        : habilidades,
    idiomas: idiomas.length === 0 && ph ? ["[Idioma] — [nível]"] : idiomas,
  };
}
