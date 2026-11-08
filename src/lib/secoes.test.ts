import { describe, expect, it } from "vitest";
import { criarExperienciaVazia, criarPerfilVazio } from "@/lib/schema";
import { statusDasSecoes } from "@/lib/secoes";

describe("statusDasSecoes", () => {
  it("marca tudo como não concluído em um perfil vazio", () => {
    const s = statusDasSecoes(criarPerfilVazio());
    expect(Object.values(s).some((x) => x.concluida)).toBe(false);
    expect(s.certificacoes.contador).toBe("vazio");
    expect(s.links.contador).toBe("0/3");
  });

  it("conta experiências e conclui dados pessoais completos", () => {
    const p = criarPerfilVazio();
    p.nomeCompleto = "Ana";
    p.cargoDesejado = "Dev";
    p.cidadeUf = "São Paulo, SP";
    p.telefone = "(11) 90000-0000";
    p.email = "ana@exemplo.com";
    p.experiencias = [criarExperienciaVazia(), criarExperienciaVazia()];
    const s = statusDasSecoes(p);
    expect(s.dados.concluida).toBe(true);
    expect(s.experiencia).toEqual({ concluida: true, contador: "2/3" });
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

  it("links só concluem com LinkedIn, mas contam todos", () => {
    const p = criarPerfilVazio();
    p.links.github = "https://github.com/ana";
    expect(statusDasSecoes(p).links).toEqual({
      concluida: false,
      contador: "1/3",
    });
  });
});
