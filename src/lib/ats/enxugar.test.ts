import { describe, expect, it } from "vitest";
import { sugerirEnxugar } from "@/lib/ats/enxugar";
import { criarExperienciaVazia, criarPerfilVazio } from "@/lib/schema";

describe("sugerirEnxugar", () => {
  it("não sugere nada para um perfil vazio", () => {
    expect(sugerirEnxugar(criarPerfilVazio())).toEqual([]);
  });

  it("começa pelos tópicos mais longos", () => {
    const p = criarPerfilVazio();
    p.experiencias = [
      {
        ...criarExperienciaVazia(),
        topicos: ["a".repeat(40), "b".repeat(109), "c".repeat(90)],
      },
      { ...criarExperienciaVazia(), topicos: ["d".repeat(100), "", ""] },
    ];
    const s = sugerirEnxugar(p);
    expect(s[0]).toBe("Encurte o tópico 2 da Experiência 1 (109 caracteres).");
    expect(s[1]).toBe("Encurte o tópico 1 da Experiência 2 (100 caracteres).");
    expect(s[2]).toContain("tópico 3 da Experiência 1");
  });

  it("sugere reduzir resumo, habilidades e certificações, até 4 itens", () => {
    const p = criarPerfilVazio();
    p.experiencias = [
      {
        ...criarExperienciaVazia(),
        topicos: ["a".repeat(100), "b".repeat(90), "c"],
      },
    ];
    p.resumo = "r".repeat(400);
    p.habilidades = [
      { titulo: "Geral", itens: Array.from({ length: 30 }, (_, i) => `L${i}`) },
    ];
    p.certificacoes = [1, 2, 3].map((n) => ({
      id: String(n),
      nome: "x",
      instituicao: "y",
      ano: "2020",
    }));
    const s = sugerirEnxugar(p);
    expect(s).toHaveLength(4);
    expect(s.some((t) => t.includes("resumo"))).toBe(true);
  });
});
