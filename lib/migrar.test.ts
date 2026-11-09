import { describe, expect, it } from "vitest";
import { migrarPerfil } from "@/lib/migrar";
import { importarJson } from "@/lib/storage";
import { criarPerfilVazio } from "@/lib/schema";

describe("migrarPerfil", () => {
  it("converte as três listas antigas em grupos, pulando as vazias", () => {
    const antigo = {
      ...criarPerfilVazio(),
      habilidades: {
        linguagens: ["TypeScript"],
        frameworks: [],
        ferramentas: ["Git"],
      },
    };
    expect(migrarPerfil(antigo)).toMatchObject({
      habilidades: [
        { titulo: "Linguagens", itens: ["TypeScript"] },
        { titulo: "Ferramentas", itens: ["Git"] },
      ],
    });
  });

  it("não mexe no formato novo nem em valores estranhos", () => {
    const novo = { habilidades: [{ titulo: "X", itens: ["a"] }] };
    expect(migrarPerfil(novo)).toBe(novo);
    expect(migrarPerfil(null)).toBeNull();
  });

  it("importa um backup antigo com habilidades em listas fixas", () => {
    const backup = {
      formato: 1,
      exportadoEm: "2026-01-01T00:00:00.000Z",
      perfil: {
        ...criarPerfilVazio(),
        habilidades: { linguagens: ["C#"], frameworks: [], ferramentas: [] },
      },
    };
    const r = importarJson(JSON.stringify(backup));
    expect(r.ok && r.dados.perfil.habilidades).toMatchObject([
      { titulo: "Linguagens", itens: ["C#"] },
    ]);
  });
});
