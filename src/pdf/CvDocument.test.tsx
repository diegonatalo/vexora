// @vitest-environment node
import { describe, expect, it } from "vitest";
import { montarCv, TITULOS_SECAO } from "@/lib/pdf/cv-model";
import { criarPerfilVazio } from "@/lib/schema";
import { perfilCompleto } from "@/tests/fixtures";
import { ajustarEmNode, gerarELer } from "@/tests/pdf-utils";

describe("CvDocument", () => {
  it("gera 1 página para um perfil completo (3 experiências x 3 tópicos)", async () => {
    const r = await ajustarEmNode(montarCv(perfilCompleto()));
    expect(r.coube).toBe(true);
    expect(r.medicao.paginas).toBe(1);
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
