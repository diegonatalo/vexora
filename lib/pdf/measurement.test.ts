import { describe, expect, it } from "vitest";
import { measurePages } from "@/lib/pdf/measurement";
import type { ReadPage } from "@/types/pdf";

const A4 = 842;
const layout = { marginV: 48, font: 11, lineHeight: 1.35 };

const page = (ys: number[], size = 11): ReadPage => ({
  height: A4,
  items: ys.map((y) => ({ str: "texto", y, size })),
  text: ys.map(() => "texto").join("\n"),
});

describe("medirPaginas", () => {
  it("mede o uso da página e as linhas que ainda cabem", () => {
    // Última linha com baseline em y=400: sobra ~350pt de 746pt úteis.
    const m = measurePages([page([700, 400])], layout, 0);
    expect(m.pages).toBe(1);
    expect(m.usedPct).toBeGreaterThan(40);
    expect(m.usedPct).toBeLessThan(55);
    expect(m.freeLines).toBe(Math.floor((400 - 11 * 0.21 - 48) / 14.85));
  });

  it("chega perto de 100% com a página cheia", () => {
    const m = measurePages([page([700, 50])], layout, 0);
    expect(m.usedPct).toBeGreaterThanOrEqual(99);
    expect(m.freeLines).toBe(0);
  });

  it("passa de 100% e zera as linhas livres quando há mais de 1 página", () => {
    const m = measurePages([page([700, 50]), page([780, 600])], layout, 0);
    expect(m.pages).toBe(2);
    expect(m.usedPct).toBeGreaterThan(100);
    expect(m.freeLines).toBe(0);
  });

  it("ignora itens em branco ao achar o fim do conteúdo", () => {
    const p = page([700, 400]);
    p.items.push({ str: "  ", y: 60, size: 11 });
    expect(measurePages([p], layout, 0).usedPct).toBe(
      measurePages([page([700, 400])], layout, 0).usedPct,
    );
  });

  it("junta o texto das páginas e repassa a contagem de imagens", () => {
    const m = measurePages([page([700]), page([700, 600])], layout, 2);
    expect(m.text).toBe("texto\ntexto\ntexto");
    expect(m.images).toBe(2);
  });

  it("documento vazio não quebra", () => {
    expect(measurePages([], layout, 0)).toMatchObject({
      pages: 0,
      usedPct: 0,
    });
  });
});
