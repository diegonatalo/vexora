import { FONTES_COMPATIVEIS, FONTES_USADAS } from "@/lib/pdf/fontes";
import { TITULOS_SECAO, type CvModel } from "@/lib/pdf/cv-model";
import type { Medicao } from "@/lib/pdf/medicao";
import type { Perfil } from "@/lib/schema";
import { sugerirEnxugar } from "@/lib/ats/enxugar";

export type Checagem = {
  id: string;
  ok: boolean;
  /** Descrição do que é verificado (mostrada quando está ok). */
  titulo: string;
  /** Quando falha: o problema em poucas palavras. */
  problema?: string;
  /** Quando falha: como corrigir. */
  correcao?: string;
  /** "aviso" = recomendação que não impede nada; "erro" = precisa corrigir. */
  severidade?: "erro" | "aviso";
};

export type ContextoAts = {
  perfil: Perfil;
  /** O que foi escrito no PDF. */
  cv: CvModel;
  /** O que a medição do PDF gerado encontrou. */
  pdf: Medicao;
  /** Fontes do documento (padrão: as que o CvDocument usa). */
  fontes?: readonly string[];
};

const DATA_MM_AAAA = /^(0[1-9]|1[0-2])\/\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

/** Seções que realmente aparecem no PDF, na ordem do layout. */
function secoesPresentes(cv: CvModel): string[] {
  const secoes: [string, boolean][] = [
    [TITULOS_SECAO.resumo, Boolean(cv.resumo)],
    [TITULOS_SECAO.experiencia, cv.experiencias.length > 0],
    [TITULOS_SECAO.formacao, cv.formacoes.length > 0],
    [TITULOS_SECAO.certificacoes, cv.certificacoes.length > 0],
    [TITULOS_SECAO.habilidades, cv.habilidades.length > 0],
    [TITULOS_SECAO.idiomas, cv.idiomas.length > 0],
  ];
  return secoes.filter(([, presente]) => presente).map(([titulo]) => titulo);
}

export function checarTextoSelecionavel({ cv, pdf }: ContextoAts): Checagem {
  const titulo = "Texto real e selecionável no PDF";
  const texto = normalizar(pdf.texto);
  const ok = texto.length > 0 && texto.includes(normalizar(cv.nome));
  return ok
    ? { id: "texto-selecionavel", ok, titulo }
    : {
        id: "texto-selecionavel",
        ok,
        titulo,
        severidade: "erro",
        problema: "O PDF não tem texto legível.",
        correcao: "Gere o PDF de novo; se persistir, recarregue a página.",
      };
}

export function checarColunaUnica({ cv, pdf }: ContextoAts): Checagem {
  const titulo = "Coluna única, ordem de leitura correta";
  const texto = normalizar(pdf.texto);
  const posicoes = secoesPresentes(cv)
    .map((t) => texto.indexOf(normalizar(t)))
    .filter((p) => p >= 0);
  const ordenado = posicoes.every((p, i) => i === 0 || p > posicoes[i - 1]);
  const nomePrimeiro =
    texto.indexOf(normalizar(cv.nome)) <= (posicoes[0] ?? Infinity);
  const ok = ordenado && nomePrimeiro;
  return ok
    ? { id: "coluna-unica", ok, titulo }
    : {
        id: "coluna-unica",
        ok,
        titulo,
        severidade: "erro",
        problema: "A ordem de leitura do PDF está fora do layout.",
        correcao: "Gere o PDF de novo com o layout padrão da Vexora.",
      };
}

export function checarTitulosPadrao({ cv, pdf }: ContextoAts): Checagem {
  const titulo = "Títulos de seção padrão";
  const texto = normalizar(pdf.texto);
  const faltando = secoesPresentes(cv).filter(
    (t) => !texto.includes(normalizar(t)),
  );
  return faltando.length === 0
    ? { id: "titulos-padrao", ok: true, titulo }
    : {
        id: "titulos-padrao",
        ok: false,
        titulo,
        severidade: "erro",
        problema: `Título não encontrado: ${faltando.join(", ")}.`,
        correcao: "Use apenas os títulos padrão da Vexora.",
      };
}

export function checarFonte({ fontes = FONTES_USADAS }: ContextoAts): Checagem {
  const titulo = "Fonte compatível (Arial)";
  const incompativeis = fontes.filter((f) => !FONTES_COMPATIVEIS.includes(f));
  return incompativeis.length === 0
    ? { id: "fonte", ok: true, titulo }
    : {
        id: "fonte",
        ok: false,
        titulo,
        severidade: "erro",
        problema: `Fonte incomum: ${incompativeis.join(", ")}.`,
        correcao: "Use Helvetica ou Arial.",
      };
}

export function checarSemImagens({ pdf }: ContextoAts): Checagem {
  const titulo = "Sem tabelas, ícones nem imagens";
  return pdf.imagens === 0
    ? { id: "sem-imagens", ok: true, titulo }
    : {
        id: "sem-imagens",
        ok: false,
        titulo,
        severidade: "erro",
        problema: `O PDF tem ${pdf.imagens} imagem(ns).`,
        correcao: "Remova imagens e ícones: o ATS não lê o que está nelas.",
      };
}

export function checarCabeEmUmaPagina({ perfil, pdf }: ContextoAts): Checagem {
  const titulo = "Cabe em 1 página";
  if (pdf.paginas <= 1) return { id: "uma-pagina", ok: true, titulo };
  const [primeira] = sugerirEnxugar(perfil);
  return {
    id: "uma-pagina",
    ok: false,
    titulo,
    severidade: "erro",
    problema: `O CV passa de 1 página (${pdf.paginas}).`,
    correcao: primeira ?? "Enxugue o conteúdo para caber em 1 página.",
  };
}

export function checarDatasPadrao({ perfil }: ContextoAts): Checagem {
  const titulo = "Datas no padrão MM/AAAA";
  const invalida = (d: string) => !DATA_MM_AAAA.test(d);

  // Itens em branco (recém-adicionados) não entram no PDF, então não contam.
  const experienciasRuins = perfil.experiencias.filter(
    (e) =>
      (e.cargo.trim() || e.empresa.trim() || e.topicos.some((t) => t.trim())) &&
      (invalida(e.inicio) || (!e.atual && invalida(e.fim))),
  );
  const formacoesRuins = perfil.formacoes.filter(
    (f) =>
      (f.curso.trim() || f.instituicao.trim()) &&
      (invalida(f.inicio) || (!f.atual && invalida(f.fim))),
  );
  if (experienciasRuins.length + formacoesRuins.length === 0) {
    return { id: "datas", ok: true, titulo };
  }
  const onde =
    experienciasRuins.length > 0 && formacoesRuins.length > 0
      ? "nas experiências e na formação"
      : experienciasRuins.length > 0
        ? "em todas as experiências"
        : "em todas as formações";
  return {
    id: "datas",
    ok: false,
    titulo,
    severidade: "erro",
    problema: "Datas fora do padrão.",
    correcao: `Use MM/AAAA ${onde}.`,
  };
}

export function checarContato({ perfil }: ContextoAts): Checagem {
  const titulo = "Contato completo";
  const faltam = [
    EMAIL.test(perfil.email.trim()) ? null : "e-mail",
    perfil.telefone.trim() ? null : "telefone",
  ].filter((x): x is string => x !== null);

  if (faltam.length > 0) {
    return {
      id: "contato",
      ok: false,
      titulo,
      severidade: "erro",
      problema: `Falta ${faltam.join(" e ")}.`,
      correcao: "Preencha em Dados pessoais: o ATS e o recrutador precisam.",
    };
  }
  if (!perfil.links.linkedin.trim()) {
    return {
      id: "contato",
      ok: false,
      titulo,
      severidade: "aviso",
      problema: "Sem link do LinkedIn.",
      correcao: "Adicione em Links e portfólio.",
    };
  }
  return { id: "contato", ok: true, titulo };
}

/** As 8 checagens, na ordem de exibição. */
export function rodarChecagens(ctx: ContextoAts): Checagem[] {
  return [
    checarTextoSelecionavel(ctx),
    checarColunaUnica(ctx),
    checarTitulosPadrao(ctx),
    checarFonte(ctx),
    checarSemImagens(ctx),
    checarCabeEmUmaPagina(ctx),
    checarDatasPadrao(ctx),
    checarContato(ctx),
  ];
}
