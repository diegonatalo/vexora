import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteData,
  loadData,
  exportJson,
  importJson,
  saveData,
} from "@/lib/storage";
import { createEmptyExperience } from "@/lib/schema";

beforeEach(async () => {
  await deleteData();
});

describe("storage", () => {
  it("cria um perfil vazio na primeira carga", async () => {
    const { profile } = await loadData();
    expect(profile.fullName).toBe("");
  });

  it("mantém os dados após salvar e carregar de novo", async () => {
    const data = await loadData();
    data.profile.fullName = "Ana Çéã";
    data.profile.experiences = [
      {
        ...createEmptyExperience(),
        jobTitle: "Dev",
        start: "01/2021",
        current: true,
      },
    ];
    await saveData(data);
    expect(await loadData()).toEqual(data);
  });

  it("exporta e reimporta sem perda", async () => {
    const data = await loadData();
    data.profile.fullName = "Ana";
    data.profile.skills = [
      { title: "Linguagens", items: ["TypeScript", "C#"], visible: true },
    ];
    const result = importJson(exportJson(data));
    expect(result).toEqual({ ok: true, data });
  });

  it("rejeita JSON inválido ou de outro formato", () => {
    expect(importJson("{quebrado").ok).toBe(false);
    expect(importJson(JSON.stringify({ foo: 1 })).ok).toBe(false);
  });

  it("recupera rascunho com campos inválidos, esvaziando só eles", async () => {
    const data = await loadData();
    data.profile.fullName = "Ana";
    data.profile.email = "ana@";
    data.profile.experiences = [
      {
        ...createEmptyExperience(),
        jobTitle: "Dev",
        start: "3/2022",
        bullets: ["x".repeat(130), "", ""],
      },
    ];
    await saveData(data);

    const { profile } = await loadData();
    expect(profile.fullName).toBe("Ana");
    expect(profile.email).toBe("");
    expect(profile.experiences[0].jobTitle).toBe("Dev");
    expect(profile.experiences[0].start).toBe("");
    expect(profile.experiences[0].bullets[0]).toHaveLength(110);
  });

  it("volta ao perfil vazio se o dado salvo estiver corrompido", async () => {
    const { set } = await import("idb-keyval");
    await set("folha:perfil", { garbage: true });
    const { profile } = await loadData();
    expect(profile.fullName).toBe("");
  });
});
