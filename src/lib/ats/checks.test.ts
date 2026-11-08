import { describe, expect, it } from "vitest";
import {
  checarCabeEmUmaPagina,
  checarColunaUnica,
  checarContato,
  checarDatasPadrao,
  checarFonte,
  checarSemImagens,
  checarTextoSelecionavel,
  checarTitulosPadrao,
  rodarChecagens,
  type ContextoAts,
} from "@/lib/ats/checks";
import { montarCv } from "@/lib/pdf/cv-model";
import type { Medicao } from "@/lib/pdf/medicao";
import {
  criarExperienciaVazia,
  criarPerfilVazio,
  type Perfil,
} from "@/lib/schema";

function perfil(): Perfil {
  const p = criarPerfilVazio();
  p.nomeCompleto = "Ana Souza";
  p.email = "ana@exemplo.com";
  p.telefone = "(11) 90000-0000";
  p.links.linkedin = "https://linkedin.com/in/ana";
  p.resumo = "Resumo curto.";
  p.experiencias = [
    {
      ...criarExperienciaVazia(),
      cargo: "Dev",
      empresa: "Acme",
      inicio: "01/2021",
      atual: true,
      topicos: ["Fiz algo", "", ""],
    },
  ];
  p.formacoes = [
    {
      id: "f",
      curso: "Ciência da Computação",
      instituicao: "USP",
      inicio: "02/2016",
      fim: "12/2019",
      atual: false,
    },
  ];
  return p;
}

const TEXTO_OK =
  "Ana Souza\nRESUMO PROFISSIONAL\nResumo curto.\nEXPERIÊNCIA PROFISSIONAL\nDev — Acme\nFORMAÇÃO ACADÊMICA\nCiência da Computação";

function ctx(
  over: Partial<ContextoAts> = {},
  p: Perfil = perfil(),
): ContextoAts {
  const pdf: Medicao = {
    paginas: 1,
    texto: TEXTO_OK,
    imagens: 0,
    usadoPct: 60,
    linhasLivres: 10,
  };
  return { perfil: p, cv: montarCv(p), pdf, ...over };
}

describe("rodarChecagens", () => {
  it("devolve as 8 checagens, todas ok para um perfil completo", () => {
    const r = rodarChecagens(ctx());
    expect(r).toHaveLength(8);
    expect(r.every((c) => c.ok)).toBe(true);
    expect(new Set(r.map((c) => c.id)).size).toBe(8);
  });
});

describe("texto selecionável", () => {
  it("falha se o PDF não tem texto ou não contém o nome", () => {
    const vazio = { ...ctx().pdf, texto: "" };
    expect(checarTextoSelecionavel(ctx({ pdf: vazio })).ok).toBe(false);
    const semNome = { ...ctx().pdf, texto: "RESUMO PROFISSIONAL" };
    expect(checarTextoSelecionavel(ctx({ pdf: semNome })).ok).toBe(false);
  });
  it("ignora acentos e espaços ao comparar", () => {
    const p = perfil();
    p.nomeCompleto = "José  Çéã";
    const pdf = { ...ctx().pdf, texto: "Jose Cea\nRESUMO PROFISSIONAL" };
    expect(checarTextoSelecionavel(ctx({ pdf }, p)).ok).toBe(true);
  });
});

describe("coluna única e ordem de leitura", () => {
  it("falha quando as seções saem fora de ordem", () => {
    const fora = {
      ...ctx().pdf,
      texto:
        "Ana Souza\nFORMAÇÃO ACADÊMICA\nEXPERIÊNCIA PROFISSIONAL\nRESUMO PROFISSIONAL",
    };
    const r = checarColunaUnica(ctx({ pdf: fora }));
    expect(r.ok).toBe(false);
    expect(r.problema).toBeTruthy();
    expect(r.correcao).toBeTruthy();
  });
  it("falha quando o nome não vem primeiro", () => {
    const texto = "RESUMO PROFISSIONAL\nAna Souza";
    expect(checarColunaUnica(ctx({ pdf: { ...ctx().pdf, texto } })).ok).toBe(
      false,
    );
  });
});

describe("títulos padrão", () => {
  it("lista o título que faltou", () => {
    const texto = "Ana Souza\nRESUMO PROFISSIONAL\nFORMAÇÃO ACADÊMICA";
    const r = checarTitulosPadrao(ctx({ pdf: { ...ctx().pdf, texto } }));
    expect(r.ok).toBe(false);
    expect(r.problema).toContain("Experiência profissional");
  });
  it("não exige títulos de seções que não aparecem no CV", () => {
    const p = criarPerfilVazio();
    p.nomeCompleto = "Ana";
    const c = ctx({ pdf: { ...ctx().pdf, texto: "Ana" } }, p);
    expect(checarTitulosPadrao(c).ok).toBe(true);
  });
});

describe("fonte, imagens e página", () => {
  it("aceita Helvetica/Arial e recusa fonte incomum", () => {
    expect(checarFonte(ctx()).ok).toBe(true);
    expect(checarFonte(ctx({ fontes: ["Arial"] })).ok).toBe(true);
    const r = checarFonte(ctx({ fontes: ["Comic-Sans"] }));
    expect(r.ok).toBe(false);
    expect(r.problema).toContain("Comic-Sans");
  });

  it("falha se o PDF tem imagens", () => {
    expect(checarSemImagens(ctx()).ok).toBe(true);
    const r = checarSemImagens(ctx({ pdf: { ...ctx().pdf, imagens: 2 } }));
    expect(r.ok).toBe(false);
    expect(r.problema).toContain("2");
  });

  it("falha com mais de 1 página e sugere o que enxugar", () => {
    const p = perfil();
    p.experiencias[0].topicos = ["x".repeat(105), "y".repeat(60), ""];
    const r = checarCabeEmUmaPagina(
      ctx({ pdf: { ...ctx().pdf, paginas: 2 } }, p),
    );
    expect(r.ok).toBe(false);
    expect(r.problema).toContain("2");
    expect(r.correcao).toContain("tópico 1");
  });
});

describe("datas", () => {
  it("falha com data fora do padrão, no formato do design", () => {
    const p = perfil();
    p.experiencias[0].inicio = "2021";
    const r = checarDatasPadrao(ctx({}, p));
    expect(r).toMatchObject({
      ok: false,
      problema: "Datas fora do padrão.",
      correcao: "Use MM/AAAA em todas as experiências.",
    });
  });
  it("exige fim quando não é o trabalho atual", () => {
    const p = perfil();
    p.experiencias[0].atual = false;
    p.experiencias[0].fim = "";
    expect(checarDatasPadrao(ctx({}, p)).ok).toBe(false);
  });
  it("cobre formações", () => {
    const p = perfil();
    p.formacoes[0].fim = "12/19";
    expect(checarDatasPadrao(ctx({}, p)).correcao).toContain("formações");
  });
  it("ignora itens em branco (recém-adicionados)", () => {
    const p = perfil();
    p.experiencias.push(criarExperienciaVazia());
    expect(checarDatasPadrao(ctx({}, p)).ok).toBe(true);
  });
});

describe("contato", () => {
  it("e-mail e telefone são obrigatórios (erro)", () => {
    const p = perfil();
    p.email = "";
    p.telefone = "";
    const r = checarContato(ctx({}, p));
    expect(r).toMatchObject({ ok: false, severidade: "erro" });
    expect(r.problema).toBe("Falta e-mail e telefone.");
  });
  it("e-mail inválido conta como faltando", () => {
    const p = perfil();
    p.email = "ana@";
    expect(checarContato(ctx({}, p)).problema).toBe("Falta e-mail.");
  });
  it("LinkedIn ausente é só aviso, no texto do design", () => {
    const p = perfil();
    p.links.linkedin = "";
    expect(checarContato(ctx({}, p))).toMatchObject({
      ok: false,
      severidade: "aviso",
      problema: "Sem link do LinkedIn.",
      correcao: "Adicione em Links e portfólio.",
    });
  });
});
