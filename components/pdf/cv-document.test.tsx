// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildCv, SECTION_TITLES } from "@/lib/pdf/cv-model";
import { createEmptyProfile } from "@/lib/schema";
import { completeProfile } from "@/tests/fixtures";
import { fitInNode, generateAndRead, readLinks } from "@/tests/pdf-utils";

describe("CvDocument", () => {
  it("gera 1 página para um perfil completo (3 experiências x 3 tópicos)", async () => {
    const r = await fitInNode(buildCv(completeProfile()));
    expect(r.fitted).toBe(true);
    expect(r.measurement.pages).toBe(1);
  });

  it("mantém texto real e selecionável, com acentos corretos", async () => {
    const { text } = await generateAndRead(buildCv(completeProfile()));
    expect(text).toContain("Ana Çéã Souza");
    expect(text).toContain("São Paulo, SP");
    expect(text).toContain("Certificação ação");
    expect(text).toContain("Experiência".toUpperCase());
    expect(text).toContain("Órgão");
    expect(text).toContain("Bacharelado em Ciência da Computação");
    // Sem hifenização automática: "migração" não pode virar "mi-gração".
    expect(text).toContain("migração");
  });

  it("escreve as seções na ordem do layout", async () => {
    const { text } = await generateAndRead(buildCv(completeProfile()));
    const uppercase = text.toUpperCase();
    const positions = [
      SECTION_TITLES.summary,
      SECTION_TITLES.experience,
      SECTION_TITLES.education,
      SECTION_TITLES.certifications,
      SECTION_TITLES.skills,
      SECTION_TITLES.languages,
    ].map((t) => uppercase.indexOf(t.toUpperCase()));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("mostra datas em MM/AAAA, 'Atual' e as linhas de habilidades", async () => {
    const { text } = await generateAndRead(buildCv(completeProfile()));
    expect(text).toContain("01/2020 – Atual");
    expect(text).toContain("01/2020 – 12/2021");
    expect(text).toContain("Linguagens:");
    expect(text).toContain("Frameworks e bibliotecas:");
    expect(text).toContain("Ferramentas:");
  });

  it("omite seções sem conteúdo no PDF baixado", async () => {
    const p = createEmptyProfile();
    p.fullName = "Ana";
    const { text, pages } = await generateAndRead(buildCv(p));
    expect(pages).toBe(1);
    expect(text).toContain("Ana");
    expect(text.toUpperCase()).not.toContain("EXPERIÊNCIA PROFISSIONAL");
  });

  it("gera 1 página também com os placeholders da pré-visualização", async () => {
    const { pages } = await generateAndRead(
      buildCv(createEmptyProfile(), { placeholders: true }),
    );
    expect(pages).toBe(1);
  });

  it("deixa e-mail, telefone e links clicáveis no PDF", async () => {
    const { bytes, text } = await generateAndRead(buildCv(completeProfile()));
    const links = await readLinks(bytes);
    expect(links.map((l) => l.url).sort()).toEqual(
      [
        "mailto:ana@exemplo.com",
        "tel:+5511900000000",
        "https://linkedin.com/in/ana",
        "https://github.com/ana",
        "https://ana.dev/", // o leitor normaliza a barra final
      ].sort(),
    );
    // A área clicável existe de verdade (não é um retângulo vazio).
    for (const l of links) expect(l.width).toBeGreaterThan(20);
    // E o texto continua o mesmo para o ATS: sem https:// e na mesma linha.
    expect(text).toContain("linkedin.com/in/ana");
    expect(text).toContain("ana@exemplo.com");
  });

  it("sem contato preenchido não há links", async () => {
    const { bytes } = await generateAndRead(buildCv(createEmptyProfile()));
    expect(await readLinks(bytes)).toEqual([]);
  });
});
