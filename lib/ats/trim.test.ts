import { describe, expect, it } from "vitest";
import { suggestTrim } from "@/lib/ats/trim";
import { createEmptyExperience, createEmptyProfile } from "@/lib/schema";

describe("sugerirEnxugar", () => {
  it("não sugere nada para um perfil vazio", () => {
    expect(suggestTrim(createEmptyProfile())).toEqual([]);
  });

  it("começa pelos tópicos mais longos", () => {
    const p = createEmptyProfile();
    p.experiences = [
      {
        ...createEmptyExperience(),
        bullets: ["a".repeat(40), "b".repeat(109), "c".repeat(90)],
      },
      { ...createEmptyExperience(), bullets: ["d".repeat(100), "", ""] },
    ];
    const s = suggestTrim(p);
    expect(s[0]).toBe("Encurte o tópico 2 da Experiência 1 (109 caracteres).");
    expect(s[1]).toBe("Encurte o tópico 1 da Experiência 2 (100 caracteres).");
    expect(s[2]).toContain("tópico 3 da Experiência 1");
  });

  it("sugere reduzir resumo, habilidades e certificações, até 4 itens", () => {
    const p = createEmptyProfile();
    p.experiences = [
      {
        ...createEmptyExperience(),
        bullets: ["a".repeat(100), "b".repeat(90), "c"],
      },
    ];
    p.summary = "r".repeat(400);
    p.skills = [
      { title: "Geral", items: Array.from({ length: 30 }, (_, i) => `L${i}`) },
    ];
    p.certifications = [1, 2, 3].map((n) => ({
      id: String(n),
      name: "x",
      institution: "y",
      year: "2020",
    }));
    const s = suggestTrim(p);
    expect(s).toHaveLength(4);
    expect(s.some((t) => t.includes("resumo"))).toBe(true);
  });
});
