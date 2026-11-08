// @vitest-environment node
import { describe, expect, it } from "vitest";
import { montarCv, TITULOS_SECAO } from "@/lib/pdf/cv-model";
import {
  criarExperienciaVazia,
  criarPerfilVazio,
  type Perfil,
} from "@/lib/schema";
import { gerarELer } from "@/tests/pdf-utils";

function perfilCompleto(): Perfil {
  const p = criarPerfilVazio();
  p.nomeCompleto = "Ana Çéã Souza";
  p.cargoDesejado = "Desenvolvedora Front-end";
  p.cidadeUf = "São Paulo, SP";
  p.telefone = "(11) 90000-0000";
  p.email = "ana@exemplo.com";
  p.links = {
    linkedin: "https://linkedin.com/in/ana",
    github: "https://github.com/ana",
    portfolio: "https://ana.dev",
  };
  p.resumo =
    "Desenvolvedora com formação em computação e foco em aplicações web acessíveis.";
  p.experiencias = [1, 2, 3].map((n) => ({
    ...criarExperienciaVazia(),
    cargo: `Cargo ${n}`,
    empresa: `Empresa ${n}`,
    cidadeUf: "São Paulo/SP",
    inicio: "01/2020",
    fim: n === 1 ? "" : "12/2021",
    atual: n === 1,
    topicos: [
      "Implementei a migração do sistema de autenticação para OAuth, reduzindo chamados.",
      "Reduzi o tempo de carregamento em 40% com otimização de imagens e divisão de código.",
      "Liderei a criação de um design system usado por três squads.",
    ],
  }));
  p.formacoes = [
    {
      id: "f1",
      curso: "Bacharelado em Ciência da Computação",
      instituicao: "Universidade Exemplo",
      inicio: "02/2016",
      fim: "12/2019",
      atual: false,
    },
  ];
  p.certificacoes = [
    { id: "c1", nome: "Certificação ação", instituicao: "Órgão", ano: "2023" },
    {
      id: "c2",
      nome: "Outra certificação",
      instituicao: "Escola",
      ano: "2022",
    },
  ];
  p.habilidades = {
    linguagens: ["TypeScript", "JavaScript"],
    frameworks: ["React", "Next.js"],
    ferramentas: ["Git", "Docker"],
  };
  p.idiomas = [
    { idioma: "Português", nivel: "nativo" },
    { idioma: "Inglês", nivel: "avançado" },
  ];
  return p;
}

describe("CvDocument", () => {
  it("gera 1 página para um perfil completo (3 experiências x 3 tópicos)", async () => {
    const { paginas } = await gerarELer(montarCv(perfilCompleto()));
    expect(paginas).toBe(1);
  });

  it("mantém texto real e selecionável, com acentos corretos", async () => {
    const { texto } = await gerarELer(montarCv(perfilCompleto()));
    expect(texto).toContain("Ana Çéã Souza");
    expect(texto).toContain("São Paulo, SP");
    expect(texto).toContain("Certificação ação");
    expect(texto).toContain("Experiência".toUpperCase());
    expect(texto).toContain("Órgão");
    expect(texto).toContain("Bacharelado em Ciência da Computação");
    // Sem hifenização automática: "migração" não pode virar "mi-gração".
    expect(texto).toContain("migração");
  });

  it("escreve as seções na ordem do layout", async () => {
    const { texto } = await gerarELer(montarCv(perfilCompleto()));
    const maiusculo = texto.toUpperCase();
    const posicoes = [
      TITULOS_SECAO.resumo,
      TITULOS_SECAO.experiencia,
      TITULOS_SECAO.formacao,
      TITULOS_SECAO.certificacoes,
      TITULOS_SECAO.habilidades,
      TITULOS_SECAO.idiomas,
    ].map((t) => maiusculo.indexOf(t.toUpperCase()));
    expect(posicoes.every((p) => p >= 0)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
  });

  it("mostra datas em MM/AAAA, 'Atual' e as linhas de habilidades", async () => {
    const { texto } = await gerarELer(montarCv(perfilCompleto()));
    expect(texto).toContain("01/2020 – Atual");
    expect(texto).toContain("01/2020 – 12/2021");
    expect(texto).toContain("Linguagens:");
    expect(texto).toContain("Frameworks e bibliotecas:");
    expect(texto).toContain("Ferramentas:");
  });

  it("omite seções sem conteúdo no PDF baixado", async () => {
    const p = criarPerfilVazio();
    p.nomeCompleto = "Ana";
    const { texto, paginas } = await gerarELer(montarCv(p));
    expect(paginas).toBe(1);
    expect(texto).toContain("Ana");
    expect(texto.toUpperCase()).not.toContain("EXPERIÊNCIA PROFISSIONAL");
  });

  it("gera 1 página também com os placeholders da pré-visualização", async () => {
    const { paginas } = await gerarELer(
      montarCv(criarPerfilVazio(), { placeholders: true }),
    );
    expect(paginas).toBe(1);
  });
});
