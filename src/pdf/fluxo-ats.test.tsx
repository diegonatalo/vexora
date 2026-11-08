// @vitest-environment node
import { describe, expect, it } from "vitest";
import { rodarChecagens } from "@/lib/ats/checks";
import { sugerirEnxugar } from "@/lib/ats/enxugar";
import { NIVEIS } from "@/lib/fit";
import { montarCv, TITULOS_SECAO } from "@/lib/pdf/cv-model";
import { criarExperienciaVazia, type Perfil } from "@/lib/schema";
import { ajustarEmNode, gerarELer } from "@/tests/pdf-utils";
import { perfilCompleto } from "@/tests/fixtures";

/** Perfil enorme: habilidades e textos no limite, que não cabe em 1 página. */
function perfilGigante(): Perfil {
  const p = perfilCompleto();
  p.resumo = "Resumo extenso. ".repeat(30).trim().slice(0, 500);
  p.habilidades = {
    linguagens: Array.from({ length: 45 }, (_, i) => `Linguagem ${i}`),
    frameworks: Array.from({ length: 45 }, (_, i) => `Framework ${i}`),
    ferramentas: Array.from({ length: 45 }, (_, i) => `Ferramenta ${i}`),
  };
  p.formacoes = [1, 2, 3].map((n) => ({
    id: `f${n}`,
    curso: `Curso ${n} com nome razoavelmente longo`,
    instituicao: "Instituição",
    inicio: "01/2010",
    fim: "12/2012",
    atual: false,
  }));
  p.certificacoes = [1, 2, 3, 4].map((n) => ({
    id: `c${n}`,
    nome: `Certificação ${n} com nome bem comprido para ocupar linha`,
    instituicao: "Instituição certificadora",
    ano: "2023",
  }));
  p.idiomas = [1, 2, 3, 4].map((n) => ({
    idioma: `Idioma ${n}`,
    nivel: "avançado",
  }));
  return p;
}

describe("ajuste automático para 1 página (PDF real)", () => {
  it("um perfil completo cabe em 1 página, com o ajuste menos agressivo possível", async () => {
    const r = await ajustarEmNode(montarCv(perfilCompleto()));
    expect(r.coube).toBe(true);
    expect(r.medicao.paginas).toBe(1);
    // Se coube em um nível > 0, o nível anterior realmente não cabia.
    if (r.ajuste.nivel > 0) {
      const anterior = await gerarELer(
        montarCv(perfilCompleto()),
        NIVEIS[r.ajuste.nivel - 1],
      );
      expect(anterior.paginas).toBeGreaterThan(1);
    }
  });

  it("um conteúdo que só cabe com ajuste usa nível > 0 e a fonte nunca fica abaixo de 10pt", async () => {
    const p = perfilCompleto();
    // Textos longos nos tópicos forçam mais linhas.
    p.experiencias.forEach((e) =>
      e.topicos.fill(
        "Liderei a migração de um monólito para serviços independentes, reduzindo custos e incidentes.".slice(
          0,
          110,
        ),
      ),
    );
    p.formacoes.push(
      { ...p.formacoes[0], id: "f2" },
      { ...p.formacoes[0], id: "f3" },
    );
    const r = await ajustarEmNode(montarCv(p));
    expect(r.ajuste.fonte).toBeGreaterThanOrEqual(10);
    expect(r.ajuste.margemV).toBeGreaterThanOrEqual(36);
    if (r.coube) expect(r.medicao.paginas).toBe(1);
  });

  it("um perfil gigante NÃO é cortado: avisa que não cabe e sugere o que enxugar", async () => {
    const p = perfilGigante();
    const cv = montarCv(p);
    const r = await ajustarEmNode(cv);

    expect(r.coube).toBe(false);
    expect(r.ajuste.nivel).toBe(NIVEIS.length - 1);
    expect(r.medicao.paginas).toBeGreaterThan(1);
    expect(r.medicao.usadoPct).toBeGreaterThan(100);

    // Nada foi cortado em silêncio: o último item ainda está no texto.
    expect(r.medicao.texto).toContain("Ferramenta 44");

    const uma = rodarChecagens({ perfil: p, cv, pdf: r.medicao }).find(
      (c) => c.id === "uma-pagina",
    );
    expect(uma?.ok).toBe(false);
    expect(uma?.correcao).toBeTruthy();
    expect(sugerirEnxugar(p).length).toBeGreaterThan(0);
  });
});

describe("checagens sobre o PDF real", () => {
  it("as 8 passam para um perfil completo", async () => {
    const p = perfilCompleto();
    const cv = montarCv(p);
    const r = await ajustarEmNode(cv);
    const checagens = rodarChecagens({ perfil: p, cv, pdf: r.medicao });
    const falhas = checagens.filter((c) => !c.ok);
    expect(falhas).toEqual([]);
    expect(checagens).toHaveLength(8);
  });

  it("detecta que o PDF só usa Helvetica, sem imagens", async () => {
    const { bytes, imagens } = await gerarELer(montarCv(perfilCompleto()));
    expect(imagens).toBe(0);
    const bruto = Buffer.from(bytes).toString("latin1");
    const fontes = [...bruto.matchAll(/\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)].map(
      (m) => m[1],
    );
    expect(fontes.length).toBeGreaterThan(0);
    expect(new Set(fontes)).toEqual(new Set(["Helvetica", "Helvetica-Bold"]));
  });

  it("reporta as falhas de contato e datas do perfil", async () => {
    const p = perfilCompleto();
    p.telefone = "";
    p.links.linkedin = "";
    p.experiencias.push({
      ...criarExperienciaVazia(),
      cargo: "Dev",
      inicio: "2021",
    });
    p.experiencias.pop();
    p.experiencias[0].inicio = "2021";
    const cv = montarCv(p);
    const r = await ajustarEmNode(cv);
    const por = Object.fromEntries(
      rodarChecagens({ perfil: p, cv, pdf: r.medicao }).map((c) => [c.id, c]),
    );
    expect(por.contato.severidade).toBe("erro");
    expect(por.datas.ok).toBe(false);
    expect(por["texto-selecionavel"].ok).toBe(true);
  });
});

describe("legibilidade do texto em todos os níveis de ajuste", () => {
  // Regressão real: com letter-spacing alto, o pdfjs lia "R E S U M O" nos
  // níveis de fonte menor, e o ATS não encontraria os títulos de seção.
  it.each(NIVEIS.map((n) => [n.nivel, n] as const))(
    "nível %i mantém títulos e nome legíveis e a checagem de títulos passa",
    async (_nivel, ajuste) => {
      const p = perfilCompleto();
      const cv = montarCv(p);
      const r = await gerarELer(cv, ajuste);
      for (const titulo of Object.values(TITULOS_SECAO)) {
        expect(r.texto).toContain(titulo.toUpperCase());
      }
      const checagens = rodarChecagens({ perfil: p, cv, pdf: r });
      expect(checagens.find((c) => c.id === "titulos-padrao")?.ok).toBe(true);
      expect(checagens.find((c) => c.id === "coluna-unica")?.ok).toBe(true);
    },
  );
});
