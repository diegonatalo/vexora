import { describe, expect, it } from "vitest";
import { criarPerfilVazio, type Perfil } from "@/lib/schema";
import { analisarVaga, lerTituloEEmpresa } from "@/lib/vaga/analisar";
import {
  aplicarAjustes,
  combinarAjustes,
  sugerirAjustes,
} from "@/lib/vaga/ajustes";
import { normalizar } from "@/lib/vaga/normalizar";

const DESCRICAO = `[Título da vaga] — [Empresa]

Requisitos:
- React, TypeScript e Next.js
- Tailwind CSS
- Git e consumo de APIs REST
- Testes automatizados
- Docker
- Metodologias ágeis`;

/** Perfil que menciona 6 dos 9 termos (faltam testes, Docker e métodos ágeis). */
function perfilComSeis(): Perfil {
  return {
    ...criarPerfilVazio(),
    nomeCompleto: "Ana Souza",
    cargoDesejado: "Desenvolvedora Front-end",
    resumo: "Desenvolvedora com foco em interfaces acessíveis.",
    experiencias: [
      {
        id: "e1",
        cargo: "Dev Front-end",
        empresa: "Acme",
        inicio: "01/2022",
        fim: "",
        atual: true,
        topicos: [
          "Manutenção de rotinas internas",
          "Criei telas com React e TypeScript",
          "Consumi APIs REST com cache",
        ],
      },
    ],
    certificacoes: [
      { id: "c1", nome: "Curso de Next.js", instituicao: "Alura", ano: "2023" },
      {
        id: "c2",
        nome: "Gestão de estoque",
        instituicao: "Senac",
        ano: "2019",
      },
    ],
    habilidades: {
      linguagens: ["HTML", "TypeScript"],
      frameworks: ["Vue", "Next.js", "Tailwind CSS"],
      ferramentas: ["Figma", "Git"],
    },
  };
}

describe("normalizar", () => {
  it("tira acentos, caixa e pontuação", () => {
    expect(normalizar("Metodologias Ágeis!")).toBe("metodologias ageis");
    expect(normalizar("Next.js, React.js")).toBe("nextjs reactjs");
    expect(normalizar("C++ e C#")).toBe("c++ e c#");
  });
});

describe("analisarVaga", () => {
  it("acha os 9 termos do exemplo e 6 deles no perfil", () => {
    const a = analisarVaga(DESCRICAO, perfilComSeis());
    expect(a.palavrasChave.map((p) => p.termo)).toEqual([
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Git",
      "APIs REST",
      "Testes automatizados",
      "Docker",
      "Metodologias ágeis",
    ]);
    expect(a.encontradas).toHaveLength(6);
    expect(a.naoEncontradas.map((p) => p.termo)).toEqual([
      "Testes automatizados",
      "Docker",
      "Metodologias ágeis",
    ]);
  });

  it("não conta CSS dentro de Tailwind CSS nem 'rest' solto", () => {
    const a = analisarVaga(
      "Tailwind CSS. Precisamos de descanso e rest.",
      criarPerfilVazio(),
    );
    expect(a.palavrasChave.map((p) => p.termo)).toEqual(["Tailwind CSS"]);
  });

  it("reconhece sinônimos e grafias", () => {
    const a = analisarVaga(
      "ReactJS, node.js e metodologia ágil",
      criarPerfilVazio(),
    );
    expect(a.palavrasChave.map((p) => p.termo)).toEqual([
      "React",
      "Node.js",
      "Metodologias ágeis",
    ]);
  });

  it("inclui termos recorrentes fora do glossário", () => {
    const a = analisarVaga(
      "Experiência com fintech. O produto fintech atende bancos.",
      criarPerfilVazio(),
    );
    expect(a.palavrasChave.map((p) => p.termo)).toContain("fintech");
  });

  it("lê título e empresa da primeira linha", () => {
    expect(lerTituloEEmpresa("Dev Front-end Pleno — Acme\nRequisitos")).toEqual(
      {
        titulo: "Dev Front-end Pleno",
        empresa: "Acme",
      },
    );
    expect(lerTituloEEmpresa("")).toEqual({ titulo: "", empresa: "" });
  });
});

describe("sugestões e ajustes", () => {
  const perfil = perfilComSeis();
  const analise = analisarVaga(DESCRICAO, perfil);
  const sugestoes = sugerirAjustes(perfil, analise);

  it("sugere as quatro ações, com o resumo desmarcado", () => {
    expect(sugestoes.map((s) => [s.id, s.padrao])).toEqual([
      ["habilidades", true],
      ["topicos", true],
      ["certificacoes", true],
      ["resumo", false],
    ]);
  });

  it("aplica sem alterar o perfil original", () => {
    const copia = structuredClone(perfil);
    const ajustado = aplicarAjustes(
      perfil,
      combinarAjustes(sugestoes.filter((s) => s.padrao)),
    );
    expect(perfil).toEqual(copia);
    expect(ajustado.habilidades.frameworks).toEqual([
      "Next.js",
      "Tailwind CSS",
      "Vue",
    ]);
    expect(ajustado.habilidades.linguagens[0]).toBe("TypeScript");
    expect(ajustado.experiencias[0].topicos[0]).toBe(
      "Criei telas com React e TypeScript",
    );
    expect(ajustado.certificacoes.map((c) => c.id)).toEqual(["c1"]);
    expect(ajustado.resumo).toBe(perfil.resumo);
  });

  it("nunca acrescenta habilidade que a pessoa não cadastrou", () => {
    const ajustado = aplicarAjustes(perfil, combinarAjustes(sugestoes));
    const todas = Object.values(ajustado.habilidades).flat().sort();
    expect(todas).toEqual(Object.values(perfil.habilidades).flat().sort());
    expect(todas).not.toContain("Docker");
  });

  it("resumo alternativo usa o título e só termos do perfil", () => {
    const comTitulo = analisarVaga(
      "Dev Front-end Pleno — Acme\nReact, Docker",
      perfil,
    );
    const resumo = sugerirAjustes(perfil, comTitulo).find(
      (s) => s.id === "resumo",
    )?.ajustes.resumoAlternativo;
    expect(resumo).toContain("Dev Front-end Pleno");
    expect(resumo).toContain("React");
    expect(resumo).not.toContain("Docker");
    expect(resumo?.length).toBeLessThanOrEqual(500);
  });

  it("ignora ajustes de itens que não existem mais", () => {
    const ajustes = combinarAjustes(sugestoes);
    const editado = {
      ...perfil,
      habilidades: { ...perfil.habilidades, frameworks: ["Vue"] },
    };
    expect(aplicarAjustes(editado, ajustes).habilidades.frameworks).toEqual([
      "Vue",
    ]);
  });
});
