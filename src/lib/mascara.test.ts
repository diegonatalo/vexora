import { describe, expect, it } from "vitest";
import { mascaraMesAno } from "@/lib/mascara";

describe("mascaraMesAno", () => {
  it.each([
    ["", ""],
    ["0", "0"],
    ["03", "03"],
    ["031", "03/1"],
    ["032022", "03/2022"],
    ["03/2022", "03/2022"],
    ["03/20222", "03/2022"],
    ["ab03c2022", "03/2022"],
    ["03/", "03"],
  ])("%j -> %j", (entrada, esperado) => {
    expect(mascaraMesAno(entrada)).toBe(esperado);
  });
});
