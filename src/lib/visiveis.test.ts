import { describe, expect, it } from "vitest";
import { montarCv } from "@/lib/pdf/cv-model";
import { somenteVisiveis } from "@/lib/visiveis";
import { perfilCompleto } from "@/tests/fixtures";

describe("exibir no CV", () => {
  it("tira os itens ocultos sem alterar o original", () => {
    const p = perfilCompleto();
    p.experiencias[1].exibir = false;
    p.certificacoes[0].exibir = false;
    p.idiomas[0].exibir = false;
    const copia = structuredClone(p);
    const v = somenteVisiveis(p);
    expect(v.experiencias.map((e) => e.cargo)).toEqual(["Cargo 1", "Cargo 3"]);
    expect(v.certificacoes).toHaveLength(p.certificacoes.length - 1);
    expect(v.idiomas).toHaveLength(p.idiomas.length - 1);
    expect(p).toEqual(copia);
  });

  it("item sem a marca (dados antigos) continua exibido", () => {
    const p = perfilCompleto();
    for (const e of p.experiencias) delete e.exibir;
    expect(somenteVisiveis(p).experiencias).toHaveLength(3);
  });

  it("o CV montado não traz o que está oculto", () => {
    const p = perfilCompleto();
    p.experiencias[0].exibir = false;
    p.certificacoes.forEach((c) => (c.exibir = false));
    const cv = montarCv(p);
    expect(cv.experiencias).toHaveLength(2);
    expect(JSON.stringify(cv)).not.toContain("Cargo 1");
    expect(cv.certificacoes).toHaveLength(0);
  });
});
