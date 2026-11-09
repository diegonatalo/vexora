import { describe, expect, it } from "vitest";
import { buildCv } from "@/lib/pdf/cv-model";
import { onlyVisible } from "@/lib/visibility";
import { completeProfile } from "@/tests/fixtures";

describe("exibir no CV", () => {
  it("tira os itens ocultos sem alterar o original", () => {
    const p = completeProfile();
    p.experiences[1].visible = false;
    p.certifications[0].visible = false;
    p.languages[0].visible = false;
    const copy = structuredClone(p);
    const v = onlyVisible(p);
    expect(v.experiences.map((e) => e.jobTitle)).toEqual(["Cargo 1", "Cargo 3"]);
    expect(v.certifications).toHaveLength(p.certifications.length - 1);
    expect(v.languages).toHaveLength(p.languages.length - 1);
    expect(p).toEqual(copy);
  });

  it("item sem a marca (dados antigos) continua exibido", () => {
    const p = completeProfile();
    for (const e of p.experiences) delete e.visible;
    expect(onlyVisible(p).experiences).toHaveLength(3);
  });

  it("o CV montado não traz o que está oculto", () => {
    const p = completeProfile();
    p.experiences[0].visible = false;
    p.certifications.forEach((c) => (c.visible = false));
    const cv = buildCv(p);
    expect(cv.experiences).toHaveLength(2);
    expect(JSON.stringify(cv)).not.toContain("Cargo 1");
    expect(cv.certifications).toHaveLength(0);
  });
});
