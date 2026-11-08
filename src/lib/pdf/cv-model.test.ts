import { describe, expect, it } from "vitest";
import { formatarPeriodo, linkCurto, montarCv } from "@/lib/pdf/cv-model";
import { criarExperienciaVazia, criarPerfilVazio } from "@/lib/schema";

describe("linkCurto", () => {
  it.each([
    ["https://www.linkedin.com/in/ana/", "linkedin.com/in/ana"],
    ["http://github.com/ana", "github.com/ana"],
    ["", ""],
  ])("%j -> %j", (entrada, esperado) => {
    expect(linkCurto(entrada)).toBe(esperado);
  });
});

describe("formatarPeriodo", () => {
  it("usa 'Atual' quando é o trabalho atual", () => {
    expect(formatarPeriodo("01/2021", "", true)).toBe("01/2021 – Atual");
    expect(formatarPeriodo("01/2021", "05/2020", true)).toBe("01/2021 – Atual");
  });
  it("junta início e fim, ou mostra o que existir", () => {
    expect(formatarPeriodo("01/2021", "06/2022", false)).toBe(
      "01/2021 – 06/2022",
    );
    expect(formatarPeriodo("01/2021", "", false)).toBe("01/2021");
    expect(formatarPeriodo("", "", false)).toBe("");
  });
});

describe("montarCv", () => {
  it("omite seções vazias no PDF real", () => {
    const cv = montarCv(criarPerfilVazio());
    expect(cv.resumo).toBe("");
    expect(cv.experiencias).toEqual([]);
    expect(cv.habilidades).toEqual([]);
    expect(cv.contato).toEqual([]);
  });

  it("preenche placeholders do design só na pré-visualização", () => {
    const cv = montarCv(criarPerfilVazio(), { placeholders: true });
    expect(cv.nome).toBe("[Seu Nome Completo]");
    expect(cv.experiencias).toHaveLength(1);
    expect(cv.habilidades.map((h) => h.rotulo)).toEqual([
      "Linguagens:",
      "Frameworks e bibliotecas:",
      "Ferramentas:",
    ]);
  });

  it("monta título, período, contato e descarta tópicos vazios", () => {
    const p = criarPerfilVazio();
    p.nomeCompleto = "Ana Souza";
    p.cidadeUf = "São Paulo, SP";
    p.email = "ana@exemplo.com";
    p.links.linkedin = "https://www.linkedin.com/in/ana/";
    p.experiencias = [
      {
        ...criarExperienciaVazia(),
        cargo: "Dev",
        empresa: "Acme",
        cidadeUf: "Remoto",
        inicio: "01/2021",
        atual: true,
        topicos: ["Reduzi o tempo de build em 40%", "  ", ""],
      },
    ];
    p.certificacoes = [
      { id: "1", nome: "AWS CCP", instituicao: "AWS", ano: "2024" },
    ];
    const cv = montarCv(p);
    expect(cv.contato).toEqual([
      "São Paulo, SP",
      "ana@exemplo.com",
      "linkedin.com/in/ana",
    ]);
    expect(cv.experiencias[0]).toEqual({
      titulo: "Dev — Acme, Remoto",
      periodo: "01/2021 – Atual",
      topicos: ["Reduzi o tempo de build em 40%"],
    });
    expect(cv.certificacoes).toEqual(["AWS CCP — AWS, 2024"]);
  });
});
