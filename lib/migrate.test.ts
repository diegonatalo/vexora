import { describe, expect, it } from "vitest";
import { migrateProfile } from "@/lib/migrate";
import { importJson } from "@/lib/storage";
import { createEmptyProfile } from "@/lib/schema";

describe("migrateProfile", () => {
  it("converte as três listas antigas em grupos, pulando as vazias", () => {
    const old = {
      ...createEmptyProfile(),
      skills: {
        linguagens: ["TypeScript"],
        frameworks: [],
        ferramentas: ["Git"],
      },
    };
    expect(migrateProfile(old)).toMatchObject({
      skills: [
        { title: "Linguagens", items: ["TypeScript"] },
        { title: "Ferramentas", items: ["Git"] },
      ],
    });
  });

  it("não altera o formato atual nem valores estranhos", () => {
    const fresh = { skills: [{ title: "X", items: ["a"] }] };
    expect(migrateProfile(fresh)).toEqual(fresh);
    expect(migrateProfile(null)).toBeNull();
  });

  it("converte os campos em português para os nomes atuais", () => {
    const old = {
      id: "p1",
      nomeCompleto: "Ana",
      cargoDesejado: "Dev",
      cidadeUf: "SP",
      telefone: "1",
      email: "",
      links: { linkedin: "", github: "", portfolio: "" },
      resumo: "Oi",
      experiencias: [
        {
          id: "e1",
          cargo: "Dev",
          empresa: "X",
          inicio: "01/2020",
          fim: "",
          atual: true,
          exibir: false,
          topicos: ["a"],
        },
      ],
      formacoes: [
        { id: "f1", curso: "CC", instituicao: "U", inicio: "", fim: "", atual: false },
      ],
      certificacoes: [{ id: "c1", nome: "N", instituicao: "I", ano: "2020" }],
      habilidades: [{ titulo: "Ferramentas", itens: ["Git"], exibir: true }],
      idiomas: [{ idioma: "Inglês", nivel: "B2" }],
    };
    expect(migrateProfile(old)).toMatchObject({
      fullName: "Ana",
      desiredJobTitle: "Dev",
      cityState: "SP",
      phone: "1",
      summary: "Oi",
      experiences: [
        { jobTitle: "Dev", company: "X", start: "01/2020", current: true, visible: false, bullets: ["a"] },
      ],
      educations: [{ course: "CC", institution: "U" }],
      certifications: [{ name: "N", institution: "I", year: "2020" }],
      skills: [{ title: "Ferramentas", items: ["Git"], visible: true }],
      languages: [{ language: "Inglês", level: "B2" }],
    });
  });

  it("importa um backup antigo com habilidades em listas fixas", () => {
    const backup = {
      format: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      profile: {
        ...createEmptyProfile(),
        skills: { linguagens: ["C#"], frameworks: [], ferramentas: [] },
      },
    };
    const r = importJson(JSON.stringify(backup));
    expect(r.ok && r.data.profile.skills).toMatchObject([
      { title: "Linguagens", items: ["C#"] },
    ]);
  });

  it("importa um backup exportado quando os campos eram em português", () => {
    const { id } = createEmptyProfile();
    const backup = {
      formato: 1,
      exportadoEm: "2026-01-01T00:00:00.000Z",
      perfil: {
        id,
        nomeCompleto: "Ana",
        cargoDesejado: "",
        cidadeUf: "",
        telefone: "",
        email: "",
        links: { linkedin: "", github: "", portfolio: "" },
        resumo: "",
        experiencias: [],
        formacoes: [],
        certificacoes: [],
        habilidades: [{ titulo: "Técnicas", itens: ["SQL"] }],
        idiomas: [],
      },
    };
    const r = importJson(JSON.stringify(backup));
    expect(r.ok && r.data.profile.fullName).toBe("Ana");
    expect(r.ok && r.data.profile.skills).toMatchObject([{ title: "Técnicas", items: ["SQL"] }]);
  });
});
