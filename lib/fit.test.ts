import { describe, expect, it } from "vitest";
import { ajustarParaUmaPagina, NIVEIS } from "@/lib/fit";
import { montarCv } from "@/lib/pdf/cv-model";
import type { Medicao } from "@/lib/pdf/medicao";
import { criarPerfilVazio } from "@/lib/schema";

const cv = montarCv(criarPerfilVazio());

/** Simula um CV que só cabe a partir de `nivelMinimo` (null = nunca cabe). */
function simular(nivelMinimo: number | null) {
  const renderizados: number[] = [];
  return {
    renderizados,
    deps: {
      renderizar: async (_cv: unknown, ajuste: { nivel: number }) => {
        renderizados.push(ajuste.nivel);
        return new Uint8Array([ajuste.nivel]);
      },
      medir: async (bytes: Uint8Array): Promise<Medicao> => {
        const nivel = bytes[0];
        const cabe = nivelMinimo !== null && nivel >= nivelMinimo;
        return {
          paginas: cabe ? 1 : 2,
          texto: "",
          imagens: 0,
          usadoPct: cabe ? 90 : 130,
          linhasLivres: 0,
        };
      },
    },
  };
}

describe("NIVEIS", () => {
  it("segue a ordem do prompt: espaçamento, depois fonte (11 a 10pt), depois margens (mín. 36)", () => {
    const [n0, n1, , n3, n4, n5] = NIVEIS;
    expect(n0.fonte).toBe(11);
    expect(n1.espacoSecao).toBeLessThan(n0.espacoSecao);
    expect(n1.fonte).toBe(11);
    expect(n3.fonte).toBe(10);
    expect(n4.margemV).toBeLessThan(n3.margemV);
    expect(n5.margemV).toBe(36);
    expect(Math.min(...NIVEIS.map((n) => n.fonte))).toBeGreaterThanOrEqual(10);
    expect(Math.min(...NIVEIS.map((n) => n.margemV))).toBeGreaterThanOrEqual(
      36,
    );
  });

  it("é monotônico: cada nível é igual ou mais compacto que o anterior", () => {
    for (let i = 1; i < NIVEIS.length; i++) {
      const a = NIVEIS[i - 1];
      const b = NIVEIS[i];
      expect(b.fonte).toBeLessThanOrEqual(a.fonte);
      expect(b.margemV).toBeLessThanOrEqual(a.margemV);
      expect(b.espacoSecao).toBeLessThanOrEqual(a.espacoSecao);
    }
  });
});

describe("ajustarParaUmaPagina", () => {
  it("não ajusta nada quando já cabe (1 renderização)", async () => {
    const s = simular(0);
    const r = await ajustarParaUmaPagina(cv, s.deps);
    expect(r.ajuste.nivel).toBe(0);
    expect(r.coube).toBe(true);
    expect(s.renderizados).toEqual([0]);
  });

  it.each([1, 2, 3, 4, 5])(
    "escolhe o menor nível que cabe (nível %i) e renderiza no máximo 5 vezes",
    async (minimo) => {
      const s = simular(minimo);
      const r = await ajustarParaUmaPagina(cv, s.deps);
      expect(r.ajuste.nivel).toBe(minimo);
      expect(r.coube).toBe(true);
      expect(r.medicao.paginas).toBe(1);
      expect(s.renderizados.length).toBeLessThanOrEqual(5);
    },
  );

  it("devolve o nível mais compacto com coube=false quando nada cabe", async () => {
    const s = simular(null);
    const r = await ajustarParaUmaPagina(cv, s.deps);
    expect(r.coube).toBe(false);
    expect(r.ajuste.nivel).toBe(NIVEIS.length - 1);
    expect(r.medicao.paginas).toBeGreaterThan(1);
  });
});
