import { describe, expect, it } from "vitest";
import {
  checkFitsOnOnePage,
  checkSingleColumn,
  checkContact,
  checkStandardDates,
  checkFont,
  checkNoImages,
  checkSelectableText,
  checkStandardTitles,
  runChecks,
  type AtsContext,
} from "@/lib/ats/checks";
import { buildCv } from "@/lib/pdf/cv-model";
import type { Measurement } from "@/types/pdf";
import {
  createEmptyExperience,
  createEmptyProfile,
  type Profile,
} from "@/lib/schema";

function profile(): Profile {
  const p = createEmptyProfile();
  p.fullName = "Ana Souza";
  p.email = "ana@exemplo.com";
  p.phone = "(11) 90000-0000";
  p.links.linkedin = "https://linkedin.com/in/ana";
  p.summary = "Resumo curto.";
  p.experiences = [
    {
      ...createEmptyExperience(),
      jobTitle: "Dev",
      company: "Acme",
      start: "01/2021",
      current: true,
      bullets: ["Fiz algo", "", ""],
    },
  ];
  p.educations = [
    {
      id: "f",
      course: "Ciência da Computação",
      institution: "USP",
      start: "02/2016",
      end: "12/2019",
      current: false,
    },
  ];
  return p;
}

const OK_TEXT =
  "Ana Souza\nRESUMO PROFISSIONAL\nResumo curto.\nEXPERIÊNCIA PROFISSIONAL\nDev — Acme\nFORMAÇÃO ACADÊMICA\nCiência da Computação";

function ctx(
  over: Partial<AtsContext> = {},
  p: Profile = profile(),
): AtsContext {
  const pdf: Measurement = {
    pages: 1,
    text: OK_TEXT,
    images: 0,
    usedPct: 60,
    freeLines: 10,
  };
  return { profile: p, cv: buildCv(p), pdf, ...over };
}

describe("rodarChecagens", () => {
  it("devolve as 8 checagens, todas ok para um perfil completo", () => {
    const r = runChecks(ctx());
    expect(r).toHaveLength(8);
    expect(r.every((c) => c.ok)).toBe(true);
    expect(new Set(r.map((c) => c.id)).size).toBe(8);
  });
});

describe("texto selecionável", () => {
  it("falha se o PDF não tem texto ou não contém o nome", () => {
    const blank = { ...ctx().pdf, text: "" };
    expect(checkSelectableText(ctx({ pdf: blank })).ok).toBe(false);
    const withoutName = { ...ctx().pdf, text: "RESUMO PROFISSIONAL" };
    expect(checkSelectableText(ctx({ pdf: withoutName })).ok).toBe(false);
  });
  it("ignora acentos e espaços ao comparar", () => {
    const p = profile();
    p.fullName = "José  Çéã";
    const pdf = { ...ctx().pdf, text: "Jose Cea\nRESUMO PROFISSIONAL" };
    expect(checkSelectableText(ctx({ pdf }, p)).ok).toBe(true);
  });
});

describe("coluna única e ordem de leitura", () => {
  it("falha quando as seções saem fora de ordem", () => {
    const outside = {
      ...ctx().pdf,
      text:
        "Ana Souza\nFORMAÇÃO ACADÊMICA\nEXPERIÊNCIA PROFISSIONAL\nRESUMO PROFISSIONAL",
    };
    const r = checkSingleColumn(ctx({ pdf: outside }));
    expect(r.ok).toBe(false);
    expect(r.problem).toBeTruthy();
    expect(r.fix).toBeTruthy();
  });
  it("falha quando o nome não vem primeiro", () => {
    const text = "RESUMO PROFISSIONAL\nAna Souza";
    expect(checkSingleColumn(ctx({ pdf: { ...ctx().pdf, text } })).ok).toBe(
      false,
    );
  });
});

describe("títulos padrão", () => {
  it("lista o título que faltou", () => {
    const text = "Ana Souza\nRESUMO PROFISSIONAL\nFORMAÇÃO ACADÊMICA";
    const r = checkStandardTitles(ctx({ pdf: { ...ctx().pdf, text } }));
    expect(r.ok).toBe(false);
    expect(r.problem).toContain("Experiência profissional");
  });
  it("não exige títulos de seções que não aparecem no CV", () => {
    const p = createEmptyProfile();
    p.fullName = "Ana";
    const c = ctx({ pdf: { ...ctx().pdf, text: "Ana" } }, p);
    expect(checkStandardTitles(c).ok).toBe(true);
  });
});

describe("fonte, imagens e página", () => {
  it("aceita Helvetica/Arial e recusa fonte incomum", () => {
    expect(checkFont(ctx()).ok).toBe(true);
    expect(checkFont(ctx({ fonts: ["Arial"] })).ok).toBe(true);
    const r = checkFont(ctx({ fonts: ["Comic-Sans"] }));
    expect(r.ok).toBe(false);
    expect(r.problem).toContain("Comic-Sans");
  });

  it("falha se o PDF tem imagens", () => {
    expect(checkNoImages(ctx()).ok).toBe(true);
    const r = checkNoImages(ctx({ pdf: { ...ctx().pdf, images: 2 } }));
    expect(r.ok).toBe(false);
    expect(r.problem).toContain("2");
  });

  it("falha com mais de 1 página e sugere o que enxugar", () => {
    const p = profile();
    p.experiences[0].bullets = ["x".repeat(105), "y".repeat(60), ""];
    const r = checkFitsOnOnePage(
      ctx({ pdf: { ...ctx().pdf, pages: 2 } }, p),
    );
    expect(r.ok).toBe(false);
    expect(r.problem).toContain("2");
    expect(r.fix).toContain("tópico 1");
  });
});

describe("datas", () => {
  it("falha com data fora do padrão, no formato do design", () => {
    const p = profile();
    p.experiences[0].start = "2021";
    const r = checkStandardDates(ctx({}, p));
    expect(r).toMatchObject({
      ok: false,
      problem: "Datas fora do padrão.",
      fix: "Use MM/AAAA em todas as experiências.",
    });
  });
  it("exige fim quando não é o trabalho atual", () => {
    const p = profile();
    p.experiences[0].current = false;
    p.experiences[0].end = "";
    expect(checkStandardDates(ctx({}, p)).ok).toBe(false);
  });
  it("cobre formações", () => {
    const p = profile();
    p.educations[0].end = "12/19";
    expect(checkStandardDates(ctx({}, p)).fix).toContain("formações");
  });
  it("ignora itens em branco (recém-adicionados)", () => {
    const p = profile();
    p.experiences.push(createEmptyExperience());
    expect(checkStandardDates(ctx({}, p)).ok).toBe(true);
  });
});

describe("contato", () => {
  it("e-mail e telefone são obrigatórios (erro)", () => {
    const p = profile();
    p.email = "";
    p.phone = "";
    const r = checkContact(ctx({}, p));
    expect(r).toMatchObject({ ok: false, severity: "error" });
    expect(r.problem).toBe("Falta e-mail e telefone.");
  });
  it("e-mail inválido conta como faltando", () => {
    const p = profile();
    p.email = "ana@";
    expect(checkContact(ctx({}, p)).problem).toBe("Falta e-mail.");
  });
  it("LinkedIn ausente é só aviso, no texto do design", () => {
    const p = profile();
    p.links.linkedin = "";
    expect(checkContact(ctx({}, p))).toMatchObject({
      ok: false,
      severity: "warning",
      problem: "Sem link do LinkedIn.",
      fix: "Adicione em Links e portfólio.",
    });
  });
});
