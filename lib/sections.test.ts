import { describe, expect, it } from "vitest";
import { createEmptyExperience, createEmptyProfile } from "@/lib/schema";
import { sectionStatuses } from "@/lib/sections";

describe("statusDasSecoes", () => {
  it("marca tudo como não concluído em um perfil vazio", () => {
    const s = sectionStatuses(createEmptyProfile());
    expect(Object.values(s).some((x) => x.completed)).toBe(false);
  });

  it("conclui dados pessoais completos e a seção de experiência", () => {
    const p = createEmptyProfile();
    p.fullName = "Ana";
    p.desiredJobTitle = "Dev";
    p.cityState = "São Paulo, SP";
    p.phone = "(11) 90000-0000";
    p.email = "ana@exemplo.com";
    p.experiences = [createEmptyExperience(), createEmptyExperience()];
    const s = sectionStatuses(p);
    expect(s.personal.completed).toBe(true);
    expect(s.experience).toEqual({ completed: true });
  });

  it("não conclui dados pessoais com e-mail inválido", () => {
    const p = createEmptyProfile();
    Object.assign(p, {
      fullName: "Ana",
      desiredJobTitle: "Dev",
      cityState: "SP",
      phone: "1",
      email: "ana@",
    });
    expect(sectionStatuses(p).personal.completed).toBe(false);
  });

  it("links só concluem com LinkedIn", () => {
    const p = createEmptyProfile();
    p.links.github = "https://github.com/ana";
    expect(sectionStatuses(p).links.completed).toBe(false);
    p.links.linkedin = "https://linkedin.com/in/ana";
    expect(sectionStatuses(p).links.completed).toBe(true);
  });

  it("seção só com itens ocultos não conta como concluída", () => {
    const p = createEmptyProfile();
    p.experiences = [{ ...createEmptyExperience(), visible: false }];
    expect(sectionStatuses(p).experience.completed).toBe(false);
  });
});
