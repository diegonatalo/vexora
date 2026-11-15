import { describe, expect, it } from "vitest";
import { z } from "zod";
import { sanitize } from "@/lib/sanitize";

const schema = z.object({
  name: z.string().max(5),
  email: z.union([z.literal(""), z.email()]),
  tags: z.array(z.string()).max(2),
  address: z.object({ city: z.string().max(3) }),
  jobs: z.array(z.object({ title: z.string().max(4) })),
});

const valid = {
  name: "Ana",
  email: "ana@ex.com",
  tags: ["a"],
  address: { city: "SP" },
  jobs: [{ title: "Dev" }],
};

describe("sanitize", () => {
  it("devolve o dado como está quando já é válido", () => {
    expect(sanitize(schema, valid)).toEqual(valid);
  });

  it("corta textos maiores que o limite", () => {
    expect(sanitize(schema, { ...valid, name: "Anabela" })?.name).toBe("Anabe");
  });

  it("esvazia textos inválidos e mantém o resto", () => {
    expect(sanitize(schema, { ...valid, email: "ana@" })).toEqual({ ...valid, email: "" });
  });

  it("corta listas maiores que o limite", () => {
    expect(sanitize(schema, { ...valid, tags: ["a", "b", "c"] })?.tags).toEqual(["a", "b"]);
  });

  it("conserta campos aninhados, em objetos e em listas", () => {
    const fixed = sanitize(schema, { ...valid, address: { city: "Santos" }, jobs: [{ title: "Designer" }] });
    expect(fixed?.address.city).toBe("San");
    expect(fixed?.jobs[0].title).toBe("Desi");
  });

  it("conserta vários problemas de uma vez", () => {
    expect(sanitize(schema, { ...valid, name: "Anabela", email: "x", tags: ["a", "b", "c"] })).toEqual({
      ...valid,
      name: "Anabe",
      email: "",
      tags: ["a", "b"],
    });
  });

  it("devolve null quando a estrutura não tem conserto", () => {
    expect(sanitize(schema, { ...valid, address: "Rua A" })).toBeNull();
    expect(sanitize(schema, { ...valid, tags: "a" })).toBeNull();
    expect(sanitize(schema, { ...valid, jobs: [{ title: 1 }] })).toBeNull();
  });

  it("devolve null para o que não é objeto", () => {
    expect(sanitize(schema, null)).toBeNull();
    expect(sanitize(schema, "texto")).toBeNull();
    expect(sanitize(schema, undefined)).toBeNull();
  });

  it("não altera o objeto original", () => {
    const raw = { ...valid, name: "Anabela" };
    sanitize(schema, raw);
    expect(raw.name).toBe("Anabela");
  });
});
