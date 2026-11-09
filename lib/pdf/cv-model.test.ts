import { describe, expect, it } from "vitest";
import {
  formatPeriod,
  emailHref,
  linkHref,
  phoneHref,
  linkCurto,
  buildCv,
} from "@/lib/pdf/cv-model";
import { createEmptyExperience, createEmptyProfile } from "@/lib/schema";

describe("linkCurto", () => {
  it.each([
    ["https://www.linkedin.com/in/ana/", "linkedin.com/in/ana"],
    ["http://github.com/ana", "github.com/ana"],
    ["", ""],
  ])("%j -> %j", (input, expected) => {
    expect(linkCurto(input)).toBe(expected);
  });
});

describe("formatarPeriodo", () => {
  it("usa 'Atual' quando é o trabalho atual", () => {
    expect(formatPeriod("01/2021", "", true)).toBe("01/2021 – Atual");
    expect(formatPeriod("01/2021", "05/2020", true)).toBe("01/2021 – Atual");
  });
  it("junta início e fim, ou mostra o que existir", () => {
    expect(formatPeriod("01/2021", "06/2022", false)).toBe(
      "01/2021 – 06/2022",
    );
    expect(formatPeriod("01/2021", "", false)).toBe("01/2021");
    expect(formatPeriod("", "", false)).toBe("");
  });
});

describe("montarCv", () => {
  it("omite seções vazias no PDF real", () => {
    const cv = buildCv(createEmptyProfile());
    expect(cv.summary).toBe("");
    expect(cv.experiences).toEqual([]);
    expect(cv.skills).toEqual([]);
    expect(cv.contact).toEqual([]);
  });

  it("preenche placeholders do design só na pré-visualização", () => {
    const cv = buildCv(createEmptyProfile(), { placeholders: true });
    expect(cv.name).toBe("[Seu Nome Completo]");
    expect(cv.experiences).toHaveLength(1);
    expect(cv.skills.map((h) => h.label)).toEqual([
      "[Grupo de habilidades]:",
    ]);
  });

  it("monta título, período, contato e descarta tópicos vazios", () => {
    const p = createEmptyProfile();
    p.fullName = "Ana Souza";
    p.cityState = "São Paulo, SP";
    p.email = "ana@exemplo.com";
    p.links.linkedin = "https://www.linkedin.com/in/ana/";
    p.experiences = [
      {
        ...createEmptyExperience(),
        jobTitle: "Dev",
        company: "Acme",
        cityState: "Remoto",
        start: "01/2021",
        current: true,
        bullets: ["Reduzi o tempo de build em 40%", "  ", ""],
      },
    ];
    p.certifications = [
      { id: "1", name: "AWS CCP", institution: "AWS", year: "2024" },
    ];
    const cv = buildCv(p);
    expect(cv.contact.map((c) => c.text)).toEqual([
      "São Paulo, SP",
      "ana@exemplo.com",
      "linkedin.com/in/ana",
    ]);
    expect(cv.experiences[0]).toEqual({
      title: "Dev — Acme, Remoto",
      period: "01/2021 – Atual",
      bullets: ["Reduzi o tempo de build em 40%"],
    });
    expect(cv.certifications).toEqual(["AWS CCP — AWS, 2024"]);
  });
});

describe("hrefs de contato", () => {
  it.each([
    ["linkedin.com/in/ana", "https://linkedin.com/in/ana"],
    ["https://github.com/ana", "https://github.com/ana"],
    ["", undefined],
  ])("hrefLink %j", (input, expected) => {
    expect(linkHref(input)).toBe(expected);
  });

  it.each([
    ["(11) 98765-4321", "tel:+5511987654321"],
    ["(11) 3456-7890", "tel:+551134567890"],
    ["+55 11 98765-4321", "tel:+5511987654321"],
    ["123", undefined],
  ])("hrefTelefone %j", (input, expected) => {
    expect(phoneHref(input)).toBe(expected);
  });

  it("hrefEmail", () => {
    expect(emailHref(" ana@x.com ")).toBe("mailto:ana@x.com");
    expect(emailHref("")).toBeUndefined();
  });
});
