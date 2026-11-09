import { describe, expect, it } from "vitest";
import {
  criarExperienciaVazia,
  criarPerfilVazio,
  experienciaSchema,
  perfilSchema,
} from "@/lib/schema";

describe("perfilSchema", () => {
  it("aceita um perfil vazio (rascunho)", () => {
    expect(perfilSchema.safeParse(criarPerfilVazio()).success).toBe(true);
  });

  it("rejeita e-mail e URL inválidos", () => {
    const perfil = criarPerfilVazio();
    perfil.email = "nao-e-email";
    perfil.links.linkedin = "linkedin sem url";
    const r = perfilSchema.safeParse(perfil);
    expect(r.success).toBe(false);
    const caminhos = r.error!.issues.map((i) => i.path.join("."));
    expect(caminhos).toContain("email");
    expect(caminhos).toContain("links.linkedin");
  });

  it("não limita a quantidade de itens das listas", () => {
    const perfil = criarPerfilVazio();
    perfil.experiencias = Array.from({ length: 8 }, criarExperienciaVazia);
    perfil.certificacoes = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      nome: "",
      instituicao: "",
      ano: "",
    }));
    expect(perfilSchema.safeParse(perfil).success).toBe(true);
  });

  it("aceita item sem a marca exibir (dados antigos) e com exibir false", () => {
    const perfil = criarPerfilVazio();
    const semMarca = criarExperienciaVazia();
    delete semMarca.exibir;
    perfil.experiencias = [semMarca, { ...semMarca, id: "x", exibir: false }];
    expect(perfilSchema.safeParse(perfil).success).toBe(true);
  });
});

describe("experienciaSchema", () => {
  const base = () => ({
    ...criarExperienciaVazia(),
    cargo: "[Cargo]",
    empresa: "[Empresa]",
  });

  it.each(["03/2022", "12/1999", ""])("aceita data %s", (data) => {
    expect(
      experienciaSchema.safeParse({ ...base(), inicio: data }).success,
    ).toBe(true);
  });

  it.each(["13/2022", "00/2022", "3/2022", "03-2022", "03/22", "2022/03"])(
    "rejeita data fora do padrão %s",
    (data) => {
      expect(
        experienciaSchema.safeParse({ ...base(), inicio: data }).success,
      ).toBe(false);
    },
  );

  it("exige início <= fim", () => {
    const r = experienciaSchema.safeParse({
      ...base(),
      inicio: "06/2023",
      fim: "05/2023",
    });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path).toEqual(["fim"]);
    expect(
      experienciaSchema.safeParse({
        ...base(),
        inicio: "06/2023",
        fim: "06/2023",
      }).success,
    ).toBe(true);
  });

  it("ignora o fim quando é o trabalho atual", () => {
    expect(
      experienciaSchema.safeParse({
        ...base(),
        inicio: "06/2023",
        fim: "01/2020",
        atual: true,
      }).success,
    ).toBe(true);
  });

  it("limita tópicos a 3 e a 110 caracteres", () => {
    expect(
      experienciaSchema.safeParse({ ...base(), topicos: ["a", "b", "c", "d"] })
        .success,
    ).toBe(false);
    expect(
      experienciaSchema.safeParse({ ...base(), topicos: ["x".repeat(111)] })
        .success,
    ).toBe(false);
    expect(
      experienciaSchema.safeParse({ ...base(), topicos: ["x".repeat(110)] })
        .success,
    ).toBe(true);
  });
});
