import { describe, expect, it } from "vitest";
import { fitToOnePage, FIT_LEVELS } from "@/lib/fit";
import { buildCv } from "@/lib/pdf/cv-model";
import type { Measurement } from "@/types/pdf";
import { createEmptyProfile } from "@/lib/schema";

const cv = buildCv(createEmptyProfile());

/** Simula um CV que só cabe a partir de `nivelMinimo` (null = nunca cabe). */
function simulate(minLevel: number | null) {
  const rendered: number[] = [];
  return {
    rendered,
    deps: {
      render: async (_cv: unknown, layoutFit: { level: number }) => {
        rendered.push(layoutFit.level);
        return new Uint8Array([layoutFit.level]);
      },
      measure: async (bytes: Uint8Array): Promise<Measurement> => {
        const level = bytes[0];
        const fits = minLevel !== null && level >= minLevel;
        return {
          pages: fits ? 1 : 2,
          text: "",
          images: 0,
          usedPct: fits ? 90 : 130,
          freeLines: 0,
        };
      },
    },
  };
}

describe("NIVEIS", () => {
  it("segue a ordem do prompt: espaçamento, depois fonte (11 a 10pt), depois margens (mín. 36)", () => {
    const [n0, n1, , n3, n4, n5] = FIT_LEVELS;
    expect(n0.font).toBe(11);
    expect(n1.sectionSpacing).toBeLessThan(n0.sectionSpacing);
    expect(n1.font).toBe(11);
    expect(n3.font).toBe(10);
    expect(n4.marginV).toBeLessThan(n3.marginV);
    expect(n5.marginV).toBe(36);
    expect(Math.min(...FIT_LEVELS.map((n) => n.font))).toBeGreaterThanOrEqual(10);
    expect(Math.min(...FIT_LEVELS.map((n) => n.marginV))).toBeGreaterThanOrEqual(
      36,
    );
  });

  it("é monotônico: cada nível é igual ou mais compacto que o anterior", () => {
    for (let i = 1; i < FIT_LEVELS.length; i++) {
      const a = FIT_LEVELS[i - 1];
      const b = FIT_LEVELS[i];
      expect(b.font).toBeLessThanOrEqual(a.font);
      expect(b.marginV).toBeLessThanOrEqual(a.marginV);
      expect(b.sectionSpacing).toBeLessThanOrEqual(a.sectionSpacing);
    }
  });
});

describe("ajustarParaUmaPagina", () => {
  it("não ajusta nada quando já cabe (1 renderização)", async () => {
    const s = simulate(0);
    const r = await fitToOnePage(cv, s.deps);
    expect(r.layoutFit.level).toBe(0);
    expect(r.fitted).toBe(true);
    expect(s.rendered).toEqual([0]);
  });

  it.each([1, 2, 3, 4, 5])(
    "escolhe o menor nível que cabe (nível %i) e renderiza no máximo 5 vezes",
    async (minimum) => {
      const s = simulate(minimum);
      const r = await fitToOnePage(cv, s.deps);
      expect(r.layoutFit.level).toBe(minimum);
      expect(r.fitted).toBe(true);
      expect(r.measurement.pages).toBe(1);
      expect(s.rendered.length).toBeLessThanOrEqual(5);
    },
  );

  it("devolve o nível mais compacto com coube=false quando nada cabe", async () => {
    const s = simulate(null);
    const r = await fitToOnePage(cv, s.deps);
    expect(r.fitted).toBe(false);
    expect(r.layoutFit.level).toBe(FIT_LEVELS.length - 1);
    expect(r.measurement.pages).toBeGreaterThan(1);
  });
});
