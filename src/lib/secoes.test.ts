import { describe, expect, it } from "vitest";
import { criarExperienciaVazia, criarPerfilVazio } from "@/lib/schema";
import { statusDasSecoes } from "@/lib/secoes";

describe("statusDasSecoes", () => {
  it("marca tudo como não concluído em um perfil vazio", () => {
    const s = statusDasSecoes(criarPerfilVazio());
    expect(Object.values(s).some((x) => x.concluida)).toBe(false);
  });

  it("conclui dados pessoais completos e a seção de experiência", () => {
    const p = criarPerfilVazio();
    p.nomeCompleto = "Ana";
    p.cargoDesejado = "Dev";
    p.cidadeUf = "São Paulo, SP";
    p.telefone = "(11) 90000-0000";
    p.email = "ana@exemplo.com";
    p.experiencias = [criarExperienciaVazia(), criarExperienciaVazia()];
    const s = statusDasSecoes(p);
    expect(s.dados.concluida).toBe(true);
    expect(s.experiencia).toEqual({ concluida: true });
  });

  it("não conclui dados pessoais com e-mail inválido", () => {
    const p = criarPerfilVazio();
    Object.assign(p, {
      nomeCompleto: "Ana",
      cargoDesejado: "Dev",
      cidadeUf: "SP",
      telefone: "1",
      email: "ana@",
    });
    expect(statusDasSecoes(p).dados.concluida).toBe(false);
  });

  it("links só concluem com LinkedIn", () => {
    const p = criarPerfilVazio();
    p.links.github = "https://github.com/ana";
    expect(statusDasSecoes(p).links.concluida).toBe(false);
    p.links.linkedin = "https://linkedin.com/in/ana";
    expect(statusDasSecoes(p).links.concluida).toBe(true);
  });

  it("seção só com itens ocultos não conta como concluída", () => {
    const p = criarPerfilVazio();
    p.experiencias = [{ ...criarExperienciaVazia(), exibir: false }];
    expect(statusDasSecoes(p).experiencia.concluida).toBe(false);
  });
});
