import { describe, expect, it } from "vitest";
import { medirPaginas, type PaginaLida } from "@/lib/pdf/medicao";

const A4 = 842;
const layout = { margemV: 48, fonte: 11, lineHeight: 1.35 };

const pagina = (ys: number[], tamanho = 11): PaginaLida => ({
  altura: A4,
  itens: ys.map((y) => ({ str: "texto", y, tamanho })),
  texto: ys.map(() => "texto").join("\n"),
});

describe("medirPaginas", () => {
  it("mede o uso da página e as linhas que ainda cabem", () => {
    // Última linha com baseline em y=400: sobra ~350pt de 746pt úteis.
    const m = medirPaginas([pagina([700, 400])], layout, 0);
    expect(m.paginas).toBe(1);
    expect(m.usadoPct).toBeGreaterThan(40);
    expect(m.usadoPct).toBeLessThan(55);
    expect(m.linhasLivres).toBe(Math.floor((400 - 11 * 0.21 - 48) / 14.85));
  });

  it("chega perto de 100% com a página cheia", () => {
    const m = medirPaginas([pagina([700, 50])], layout, 0);
    expect(m.usadoPct).toBeGreaterThanOrEqual(99);
    expect(m.linhasLivres).toBe(0);
  });

  it("passa de 100% e zera as linhas livres quando há mais de 1 página", () => {
    const m = medirPaginas([pagina([700, 50]), pagina([780, 600])], layout, 0);
    expect(m.paginas).toBe(2);
    expect(m.usadoPct).toBeGreaterThan(100);
    expect(m.linhasLivres).toBe(0);
  });

  it("ignora itens em branco ao achar o fim do conteúdo", () => {
    const p = pagina([700, 400]);
    p.itens.push({ str: "  ", y: 60, tamanho: 11 });
    expect(medirPaginas([p], layout, 0).usadoPct).toBe(
      medirPaginas([pagina([700, 400])], layout, 0).usadoPct,
    );
  });

  it("junta o texto das páginas e repassa a contagem de imagens", () => {
    const m = medirPaginas([pagina([700]), pagina([700, 600])], layout, 2);
    expect(m.texto).toBe("texto\ntexto\ntexto");
    expect(m.imagens).toBe(2);
  });

  it("documento vazio não quebra", () => {
    expect(medirPaginas([], layout, 0)).toMatchObject({
      paginas: 0,
      usadoPct: 0,
    });
  });
});
