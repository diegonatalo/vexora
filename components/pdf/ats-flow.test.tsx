// @vitest-environment node
import { describe, expect, it } from "vitest";
import { runChecks } from "@/lib/ats/checks";
import { suggestTrim } from "@/lib/ats/trim";
import { FIT_LEVELS } from "@/lib/fit";
import { buildCv, SECTION_TITLES } from "@/lib/pdf/cv-model";
import { createEmptyExperience, type Profile } from "@/lib/schema";
import { fitInNode, generateAndRead } from "@/tests/pdf-utils";
import { completeProfile } from "@/tests/fixtures";

/** Perfil enorme: habilidades e textos no limite, que não cabe em 1 página. */
function hugeProfile(): Profile {
  const p = completeProfile();
  p.summary = "Resumo extenso. ".repeat(30).trim().slice(0, 500);
  p.skills = ["Linguagem", "Framework", "Ferramenta"].map((title) => ({
    title,
    items: Array.from({ length: 45 }, (_, i) => `${title} ${i}`),
  }));
  p.educations = [1, 2, 3].map((n) => ({
    id: `f${n}`,
    course: `Curso ${n} com nome razoavelmente longo`,
    institution: "Instituição",
    start: "01/2010",
    end: "12/2012",
    current: false,
  }));
  p.certifications = [1, 2, 3, 4].map((n) => ({
    id: `c${n}`,
    name: `Certificação ${n} com nome bem comprido para ocupar linha`,
    institution: "Instituição certificadora",
    year: "2023",
  }));
  p.languages = [1, 2, 3, 4].map((n) => ({
    language: `Idioma ${n}`,
    level: "avançado",
  }));
  return p;
}

describe("ajuste automático para 1 página (PDF real)", () => {
  it("um perfil completo cabe em 1 página, com o ajuste menos agressivo possível", async () => {
    const r = await fitInNode(buildCv(completeProfile()));
    expect(r.fitted).toBe(true);
    expect(r.measurement.pages).toBe(1);
    // Se coube em um nível > 0, o nível anterior realmente não cabia.
    if (r.layoutFit.level > 0) {
      const previous = await generateAndRead(
        buildCv(completeProfile()),
        FIT_LEVELS[r.layoutFit.level - 1],
      );
      expect(previous.pages).toBeGreaterThan(1);
    }
  });

  it("um conteúdo que só cabe com ajuste usa nível > 0 e a fonte nunca fica abaixo de 10pt", async () => {
    const p = completeProfile();
    // Textos longos nos tópicos forçam mais linhas.
    p.experiences.forEach((e) =>
      e.bullets.fill(
        "Liderei a migração de um monólito para serviços independentes, reduzindo custos e incidentes.".slice(
          0,
          110,
        ),
      ),
    );
    p.educations.push(
      { ...p.educations[0], id: "f2" },
      { ...p.educations[0], id: "f3" },
    );
    const r = await fitInNode(buildCv(p));
    expect(r.layoutFit.font).toBeGreaterThanOrEqual(10);
    expect(r.layoutFit.marginV).toBeGreaterThanOrEqual(36);
    if (r.fitted) expect(r.measurement.pages).toBe(1);
  });

  it("um perfil gigante NÃO é cortado: avisa que não cabe e sugere o que enxugar", async () => {
    const p = hugeProfile();
    const cv = buildCv(p);
    const r = await fitInNode(cv);

    expect(r.fitted).toBe(false);
    expect(r.layoutFit.level).toBe(FIT_LEVELS.length - 1);
    expect(r.measurement.pages).toBeGreaterThan(1);
    expect(r.measurement.usedPct).toBeGreaterThan(100);

    // Nada foi cortado em silêncio: o último item ainda está no texto.
    expect(r.measurement.text).toContain("Ferramenta 44");

    const one = runChecks({ profile: p, cv, pdf: r.measurement }).find(
      (c) => c.id === "one-page",
    );
    expect(one?.ok).toBe(false);
    expect(one?.fix).toBeTruthy();
    expect(suggestTrim(p).length).toBeGreaterThan(0);
  });
});

describe("checagens sobre o PDF real", () => {
  it("as 8 passam para um perfil completo", async () => {
    const p = completeProfile();
    const cv = buildCv(p);
    const r = await fitInNode(cv);
    const checks = runChecks({ profile: p, cv, pdf: r.measurement });
    const failures = checks.filter((c) => !c.ok);
    expect(failures).toEqual([]);
    expect(checks).toHaveLength(8);
  });

  it("detecta que o PDF só usa Helvetica, sem imagens", async () => {
    const { bytes, images } = await generateAndRead(buildCv(completeProfile()));
    expect(images).toBe(0);
    const raw = Buffer.from(bytes).toString("latin1");
    const fonts = [...raw.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)].map(
      (m) => m[1],
    );
    expect(fonts.length).toBeGreaterThan(0);
    expect(new Set(fonts)).toEqual(new Set(["Helvetica", "Helvetica-Bold"]));
  });

  it("reporta as falhas de contato e datas do perfil", async () => {
    const p = completeProfile();
    p.phone = "";
    p.links.linkedin = "";
    p.experiences.push({
      ...createEmptyExperience(),
      jobTitle: "Dev",
      start: "2021",
    });
    p.experiences.pop();
    p.experiences[0].start = "2021";
    const cv = buildCv(p);
    const r = await fitInNode(cv);
    const by = Object.fromEntries(
      runChecks({ profile: p, cv, pdf: r.measurement }).map((c) => [c.id, c]),
    );
    expect(by.contact.severity).toBe("error");
    expect(by.dates.ok).toBe(false);
    expect(by["selectable-text"].ok).toBe(true);
  });
});

describe("legibilidade do texto em todos os níveis de ajuste", () => {
  // Regressão real: com letter-spacing alto, o pdfjs lia "R E S U M O" nos
  // níveis de fonte menor, e o ATS não encontraria os títulos de seção.
  it.each(FIT_LEVELS.map((n) => [n.level, n] as const))(
    "nível %i mantém títulos e nome legíveis e a checagem de títulos passa",
    async (_level, layoutFit) => {
      const p = completeProfile();
      const cv = buildCv(p);
      const r = await generateAndRead(cv, layoutFit);
      for (const title of Object.values(SECTION_TITLES)) {
        expect(r.text).toContain(title.toUpperCase());
      }
      const checks = runChecks({ profile: p, cv, pdf: r });
      expect(checks.find((c) => c.id === "standard-titles")?.ok).toBe(true);
      expect(checks.find((c) => c.id === "single-column")?.ok).toBe(true);
    },
  );
});
