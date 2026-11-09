import { describe, expect, it } from "vitest";
import {
  createEmptyExperience,
  createEmptyProfile,
  experienceSchema,
  profileSchema,
} from "@/lib/schema";

describe("perfilSchema", () => {
  it("aceita um perfil vazio (rascunho)", () => {
    expect(profileSchema.safeParse(createEmptyProfile()).success).toBe(true);
  });

  it("rejeita e-mail e URL inválidos", () => {
    const profile = createEmptyProfile();
    profile.email = "nao-e-email";
    profile.links.linkedin = "linkedin sem url";
    const r = profileSchema.safeParse(profile);
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path.join("."));
    expect(paths).toContain("email");
    expect(paths).toContain("links.linkedin");
  });

  it("não limita a quantidade de itens das listas", () => {
    const profile = createEmptyProfile();
    profile.experiences = Array.from({ length: 8 }, createEmptyExperience);
    profile.certifications = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      name: "",
      institution: "",
      year: "",
    }));
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });

  it("aceita item sem a marca exibir (dados antigos) e com exibir false", () => {
    const profile = createEmptyProfile();
    const withoutMark = createEmptyExperience();
    delete withoutMark.visible;
    profile.experiences = [withoutMark, { ...withoutMark, id: "x", visible: false }];
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });
});

describe("experienciaSchema", () => {
  const base = () => ({
    ...createEmptyExperience(),
    jobTitle: "[Cargo]",
    company: "[Empresa]",
  });

  it.each(["03/2022", "12/1999", ""])("aceita data %s", (data) => {
    expect(
      experienceSchema.safeParse({ ...base(), start: data }).success,
    ).toBe(true);
  });

  it.each(["13/2022", "00/2022", "3/2022", "03-2022", "03/22", "2022/03"])(
    "rejeita data fora do padrão %s",
    (data) => {
      expect(
        experienceSchema.safeParse({ ...base(), start: data }).success,
      ).toBe(false);
    },
  );

  it("exige início <= fim", () => {
    const r = experienceSchema.safeParse({
      ...base(),
      start: "06/2023",
      end: "05/2023",
    });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path).toEqual(["fim"]);
    expect(
      experienceSchema.safeParse({
        ...base(),
        start: "06/2023",
        end: "06/2023",
      }).success,
    ).toBe(true);
  });

  it("ignora o fim quando é o trabalho atual", () => {
    expect(
      experienceSchema.safeParse({
        ...base(),
        start: "06/2023",
        end: "01/2020",
        current: true,
      }).success,
    ).toBe(true);
  });

  it("limita tópicos a 3 e a 110 caracteres", () => {
    expect(
      experienceSchema.safeParse({ ...base(), bullets: ["a", "b", "c", "d"] })
        .success,
    ).toBe(false);
    expect(
      experienceSchema.safeParse({ ...base(), bullets: ["x".repeat(111)] })
        .success,
    ).toBe(false);
    expect(
      experienceSchema.safeParse({ ...base(), bullets: ["x".repeat(110)] })
        .success,
    ).toBe(true);
  });
});
