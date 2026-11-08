import { beforeEach, describe, expect, it } from "vitest";
import {
  apagarDados,
  carregarDados,
  exportarJson,
  importarJson,
  salvarDados,
} from "@/lib/storage";
import { criarExperienciaVazia } from "@/lib/schema";

beforeEach(async () => {
  await apagarDados();
});

describe("storage", () => {
  it("cria perfil vazio e uma versão padrão na primeira carga", async () => {
    const { perfil, versoes } = await carregarDados();
    expect(perfil.nomeCompleto).toBe("");
    expect(versoes).toHaveLength(1);
    expect(versoes[0].perfilId).toBe(perfil.id);
  });

  it("mantém os dados após salvar e carregar de novo", async () => {
    const dados = await carregarDados();
    dados.perfil.nomeCompleto = "Ana Çéã";
    dados.perfil.experiencias = [
      {
        ...criarExperienciaVazia(),
        cargo: "Dev",
        inicio: "01/2021",
        atual: true,
      },
    ];
    await salvarDados(dados);
    expect(await carregarDados()).toEqual(dados);
  });

  it("exporta e reimporta sem perda", async () => {
    const dados = await carregarDados();
    dados.perfil.nomeCompleto = "Ana";
    dados.perfil.habilidades.linguagens = ["TypeScript", "C#"];
    const resultado = importarJson(exportarJson(dados));
    expect(resultado).toEqual({ ok: true, dados });
  });

  it("rejeita JSON inválido ou de outro formato", () => {
    expect(importarJson("{quebrado").ok).toBe(false);
    expect(importarJson(JSON.stringify({ foo: 1 })).ok).toBe(false);
  });

  it("recupera rascunho com campos inválidos, esvaziando só eles", async () => {
    const dados = await carregarDados();
    dados.perfil.nomeCompleto = "Ana";
    dados.perfil.email = "ana@";
    dados.perfil.experiencias = [
      {
        ...criarExperienciaVazia(),
        cargo: "Dev",
        inicio: "3/2022",
        topicos: ["x".repeat(130), "", ""],
      },
    ];
    await salvarDados(dados);

    const { perfil } = await carregarDados();
    expect(perfil.nomeCompleto).toBe("Ana");
    expect(perfil.email).toBe("");
    expect(perfil.experiencias[0].cargo).toBe("Dev");
    expect(perfil.experiencias[0].inicio).toBe("");
    expect(perfil.experiencias[0].topicos[0]).toHaveLength(110);
  });

  it("volta ao perfil vazio se o dado salvo estiver corrompido", async () => {
    const { set } = await import("idb-keyval");
    await set("folha:perfil", { lixo: true });
    const { perfil } = await carregarDados();
    expect(perfil.nomeCompleto).toBe("");
  });
});
