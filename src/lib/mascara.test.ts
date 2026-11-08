import { describe, expect, it } from "vitest";
import {
  BASE_GITHUB,
  BASE_LINKEDIN,
  mascaraMesAno,
  mascaraTelefone,
  normalizarPerfilSocial,
  normalizarSite,
} from "@/lib/mascara";

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

describe("mascaraTelefone", () => {
  it.each([
    ["", ""],
    ["1", "(1"],
    ["11", "(11"],
    ["119", "(11) 9"],
    ["119876", "(11) 9876"],
    ["1198765", "(11) 9876-5"],
    ["1198765432", "(11) 9876-5432"],
    ["11987654321", "(11) 98765-4321"],
    ["(11) 98765-4321", "(11) 98765-4321"],
    ["119876543219999", "(11) 98765-4321"],
    ["abc", ""],
  ])("%j -> %j", (entrada, esperado) => {
    expect(mascaraTelefone(entrada)).toBe(esperado);
  });
});

describe("links", () => {
  it.each([
    ["ana-souza", "https://linkedin.com/in/ana-souza"],
    ["@ana-souza", "https://linkedin.com/in/ana-souza"],
    ["  ana  ", "https://linkedin.com/in/ana"],
    ["linkedin.com/in/ana", "https://linkedin.com/in/ana"],
    ["www.linkedin.com/in/ana", "https://www.linkedin.com/in/ana"],
    ["https://linkedin.com/in/ana", "https://linkedin.com/in/ana"],
    ["http://linkedin.com/in/ana", "http://linkedin.com/in/ana"],
    ["", ""],
  ])("linkedin %j -> %j", (entrada, esperado) => {
    expect(normalizarPerfilSocial(entrada, BASE_LINKEDIN)).toBe(esperado);
  });

  it("github usa a base do GitHub", () => {
    expect(normalizarPerfilSocial("ana", BASE_GITHUB)).toBe(
      "https://github.com/ana",
    );
  });

  it.each([
    ["seusite.dev", "https://seusite.dev"],
    ["https://seusite.dev", "https://seusite.dev"],
    ["", ""],
  ])("site %j -> %j", (entrada, esperado) => {
    expect(normalizarSite(entrada)).toBe(esperado);
  });
});
