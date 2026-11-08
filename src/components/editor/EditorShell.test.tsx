import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom não desenha canvas nem roda react-pdf/pdfjs: a geração real é testada em src/pdf/*.test.
const { prepararMock } = vi.hoisted(() => ({ prepararMock: vi.fn() }));
vi.mock("@/components/preview/PdfPreview", () => ({
  default: () => <div data-testid="previa" />,
}));
vi.mock("@/lib/pdf/preparar", () => ({ prepararPdf: prepararMock }));
vi.mock("@/lib/pdf/gerar", () => ({
  nomeDoArquivo: (nome: string) => `cv-${nome}.pdf`,
}));

import { EditorShell } from "@/components/editor/EditorShell";
import { NIVEIS } from "@/lib/fit";
import { montarCv, TITULOS_SECAO } from "@/lib/pdf/cv-model";
import type { Medicao } from "@/lib/pdf/medicao";
import {
  criarExperienciaVazia,
  criarPerfilVazio,
  type Perfil,
} from "@/lib/schema";
import type { Dados } from "@/lib/storage";

/** Resultado de prepararPdf sem gerar PDF de verdade. */
function preparadoFalso(
  perfil: Perfil,
  over: Partial<Medicao> & { coube?: boolean } = {},
) {
  const cv = montarCv(perfil);
  const { coube = true, ...medicao } = over;
  return {
    cv,
    ajuste: NIVEIS[0],
    coube,
    bytes: new Uint8Array([37, 80, 68, 70]),
    medicao: {
      paginas: coube ? 1 : 2,
      texto: [cv.nome, ...Object.values(TITULOS_SECAO)]
        .map((x) => x.toUpperCase())
        .join("\n"),
      imagens: 0,
      usadoPct: coube ? 78 : 130,
      linhasLivres: coube ? 5 : 0,
      ...medicao,
    },
  };
}

beforeEach(() => {
  prepararMock.mockReset();
  prepararMock.mockImplementation(async (p: Perfil) => preparadoFalso(p));
});

function montar(ajustar?: (d: Dados) => void) {
  const perfil = criarPerfilVazio();
  const dados: Dados = { perfil };
  ajustar?.(dados);
  const onAlterar = vi.fn();
  const usuario = userEvent.setup();
  render(
    <EditorShell dadosIniciais={dados} estado="salvo" onAlterar={onAlterar} />,
  );
  return { usuario, onAlterar };
}

const irPara = (u: ReturnType<typeof userEvent.setup>, secao: string) =>
  u.click(
    within(screen.getByRole("navigation", { name: "Seções" })).getByRole(
      "button",
      { name: new RegExp(secao) },
    ),
  );

describe("navegação", () => {
  it("troca de seção pelo menu e pelos botões, movendo o foco ao título", async () => {
    const { usuario } = montar();
    expect(
      screen.getByRole("heading", { level: 2, name: "Dados pessoais" }),
    ).toBeInTheDocument();

    await irPara(usuario, "Resumo");
    const titulo = screen.getByRole("heading", { level: 2, name: "Resumo" });
    expect(titulo).toHaveFocus();

    await irPara(usuario, "Experiência");
    expect(
      screen.getByRole("heading", { level: 2, name: "Experiência" }),
    ).toBeInTheDocument();

    // Botões de rodapé: próxima e anterior.
    await usuario.click(screen.getByRole("button", { name: "Formação" }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Formação" }),
    ).toHaveFocus();
    await usuario.click(screen.getByRole("button", { name: "Experiência" }));
    expect(
      screen.getByRole("heading", { level: 2, name: "Experiência" }),
    ).toHaveFocus();
  });

  it("marca a seção ativa com aria-current", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [criarExperienciaVazia()];
    });
    await irPara(usuario, "Experiência");
    const item = screen.getByRole("button", { name: /^Experiência/ });
    expect(item).toHaveAttribute("aria-current", "step");
    expect(item).toHaveTextContent("(concluída)");
    expect(
      screen.getByRole("button", { name: /^Certificações/ }),
    ).toHaveTextContent("(incompleta)");
  });
});

describe("experiência", () => {
  it("mostra o contador de caracteres e liga o erro ao campo por aria-describedby", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [criarExperienciaVazia()];
    });
    await irPara(usuario, "Experiência");

    const campo = screen.getByRole("textbox", { name: /Tópico 1/ });
    expect(campo).toHaveAccessibleName("Tópico 1 · 0/110");

    await usuario.click(campo);
    await usuario.paste("x".repeat(111));
    await usuario.tab();

    expect(campo).toHaveAccessibleName("Tópico 1 · 111/110");
    expect(campo).toBeInvalid();
    expect(campo).toHaveAccessibleDescription(/no máximo 110 caracteres/);
  });

  it("valida data fora do padrão ao sair do campo", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [criarExperienciaVazia()];
    });
    await irPara(usuario, "Experiência");

    const inicio = screen.getByRole("textbox", { name: "Início" });
    await usuario.type(inicio, "132022");
    expect(inicio).toHaveValue("13/2022");
    await usuario.tab();
    expect(inicio).toBeInvalid();
    expect(inicio).toHaveAccessibleDescription(/MM\/AAAA/);
  });

  it("desabilita o fim quando é o trabalho atual", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [criarExperienciaVazia()];
    });
    await irPara(usuario, "Experiência");
    await usuario.click(
      screen.getByRole("checkbox", { name: "Trabalho aqui atualmente" }),
    );
    expect(screen.getByRole("textbox", { name: "Fim" })).toBeDisabled();
  });

  it("não limita a quantidade de experiências", async () => {
    const { usuario } = montar();
    await irPara(usuario, "Experiência");
    for (let i = 0; i < 5; i++) {
      await usuario.click(
        screen.getByRole("button", { name: "Adicionar experiência" }),
      );
    }
    expect(
      screen.getByRole("button", { name: "Adicionar experiência" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("checkbox", { name: /Exibir experiência \d no CV/ }),
    ).toHaveLength(5);
  });

  it('"Exibir no CV" oculta o item do CV sem apagá-lo', async () => {
    const { usuario, onAlterar } = montar((d) => {
      d.perfil.certificacoes = [
        { id: "c1", nome: "Curso A", instituicao: "X", ano: "2023" },
        { id: "c2", nome: "Curso B", instituicao: "Y", ano: "2022" },
      ];
    });
    await irPara(usuario, "Certificações");
    const caixa = screen.getByRole("checkbox", {
      name: "Exibir certificação 2 no CV",
    });
    expect(caixa).toBeChecked();
    await usuario.click(caixa);
    expect(caixa).not.toBeChecked();
    const ultimo = onAlterar.mock.calls.at(-1)![0];
    expect(ultimo.perfil.certificacoes).toHaveLength(2);
    expect(ultimo.perfil.certificacoes[1].exibir).toBe(false);
    expect(ultimo.perfil.certificacoes[0].exibir).not.toBe(false);
  });

  it("recolhe as demais experiências e abre ao clicar", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [
        { ...criarExperienciaVazia(), cargo: "Dev" },
        { ...criarExperienciaVazia(), cargo: "Estagiário" },
      ];
    });
    await irPara(usuario, "Experiência");
    expect(screen.getAllByRole("textbox", { name: "Cargo" })).toHaveLength(1);
    await usuario.click(screen.getByRole("button", { name: /Estagiário/ }));
    const cargos = screen.getAllByRole("textbox", { name: "Cargo" });
    expect(cargos.map((c) => (c as HTMLInputElement).value)).toContain(
      "Estagiário",
    );
  });

  it("recolhe e exibe de novo uma experiência pelo botão", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [{ ...criarExperienciaVazia(), cargo: "Dev" }];
    });
    await irPara(usuario, "Experiência");
    await usuario.click(
      screen.getByRole("button", { name: "Recolher experiência 1" }),
    );
    expect(
      screen.queryByRole("textbox", { name: "Cargo" }),
    ).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: /Experiência 1/ }));
    expect(screen.getByRole("textbox", { name: "Cargo" })).toHaveValue("Dev");
  });

  it("permite várias experiências abertas ao mesmo tempo", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [
        { ...criarExperienciaVazia(), cargo: "Dev" },
        { ...criarExperienciaVazia(), cargo: "Estagiário" },
      ];
    });
    await irPara(usuario, "Experiência");
    await usuario.click(screen.getByRole("button", { name: /Estagiário/ }));
    expect(screen.getAllByRole("textbox", { name: "Cargo" })).toHaveLength(2);
  });
});

describe("persistência", () => {
  it("emite o perfil alterado a cada edição", async () => {
    const { usuario, onAlterar } = montar();
    await usuario.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    expect(onAlterar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        perfil: expect.objectContaining({ nomeCompleto: "Ana" }),
      }),
    );
  });

  it("salva também rascunhos com campo inválido", async () => {
    const { usuario, onAlterar } = montar();
    await usuario.type(screen.getByRole("textbox", { name: "E-mail" }), "ana@");
    expect(onAlterar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        perfil: expect.objectContaining({ email: "ana@" }),
      }),
    );
  });
});

describe("habilidades", () => {
  it("aceita vírgulas e espaços ao digitar e salva como lista", async () => {
    const { usuario, onAlterar } = montar();
    await irPara(usuario, "Habilidades");
    await usuario.click(
      screen.getByRole("button", { name: "Adicionar grupo de habilidades" }),
    );
    await usuario.type(
      screen.getByRole("textbox", { name: "Nome do grupo" }),
      "Atendimento",
    );
    const campo = screen.getByRole("textbox", { name: "Habilidades" });
    await usuario.type(campo, "TypeScript, C#, ");
    expect(campo).toHaveValue("TypeScript, C#, ");
    expect(onAlterar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        perfil: expect.objectContaining({
          habilidades: [
            expect.objectContaining({
              titulo: "Atendimento",
              itens: ["TypeScript", "C#"],
            }),
          ],
        }),
      }),
    );
  });
});

describe("baixar PDF", () => {
  it("fica desabilitado sem nome e habilita ao preencher", async () => {
    const { usuario } = montar();
    const botao = screen.getByRole("button", { name: "Baixar PDF" });
    expect(botao).toBeDisabled();
    await usuario.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    expect(botao).toBeEnabled();
  });

  it("prepara o PDF com o perfil atual ao clicar e baixa o arquivo", async () => {
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    const clique = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { usuario } = montar();
    await usuario.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    prepararMock.mockClear();
    await usuario.click(screen.getByRole("button", { name: "Baixar PDF" }));
    expect(prepararMock).toHaveBeenCalledWith(
      expect.objectContaining({ nomeCompleto: "Ana" }),
    );
    expect(clique).toHaveBeenCalled();
    clique.mockRestore();
  });

  it("avisa quando a geração falha", async () => {
    const { usuario } = montar();
    await usuario.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    prepararMock.mockRejectedValueOnce(new Error("falhou"));
    await usuario.click(screen.getByRole("button", { name: "Baixar PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível gerar o PDF",
    );
  });

  it("não baixa se o CV passa de 1 página e explica o motivo", async () => {
    prepararMock.mockImplementation(async (p: Perfil) =>
      preparadoFalso(p, { coube: false }),
    );
    const clique = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    montar((d) => {
      d.perfil.nomeCompleto = "Ana";
    });
    // A análise (com debounce) marca que não cabe e bloqueia o botão.
    await screen.findByRole("alert", {}, { timeout: 2000 });
    const botao = screen.getByRole("button", { name: "Baixar PDF" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("title", expect.stringContaining("1 página"));
    expect(clique).not.toHaveBeenCalled();
    clique.mockRestore();
  });
});

describe("verificação ATS e espaço da página", () => {
  it("mostra o resultado das checagens e o uso da página", async () => {
    montar((d) => {
      d.perfil.nomeCompleto = "Ana";
      d.perfil.email = "ana@exemplo.com";
      d.perfil.telefone = "(11) 90000-0000";
      d.perfil.links.linkedin = "https://linkedin.com/in/ana";
    });
    expect(await screen.findByText("8 de 8 ok")).toBeInTheDocument();
    expect(screen.getByText("78% usado")).toBeInTheDocument();
    expect(
      screen.getByText("Restam cerca de 5 linhas antes de estourar a página."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Espaço da página usado" }),
    ).toHaveAttribute("aria-valuenow", "78");
  });

  it("mostra o problema e a correção das checagens que falham", async () => {
    montar((d) => {
      d.perfil.nomeCompleto = "Ana";
      d.perfil.email = "ana@exemplo.com";
      d.perfil.telefone = "(11) 90000-0000";
    });
    expect(await screen.findByText("7 de 8 ok")).toBeInTheDocument();
    expect(screen.getByText("Sem link do LinkedIn.")).toBeInTheDocument();
    expect(
      screen.getByText(/Adicione em Links e portfólio\./),
    ).toBeInTheDocument();
  });

  it("atualiza as checagens de contato na hora, sem esperar o PDF", async () => {
    const { usuario } = montar((d) => {
      d.perfil.nomeCompleto = "Ana";
    });
    await screen.findByText(/de 8 ok/);
    expect(screen.getByText("Falta e-mail e telefone.")).toBeInTheDocument();
    await usuario.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "ana@exemplo.com",
    );
    expect(screen.getByText("Falta telefone.")).toBeInTheDocument();
  });

  it("avisa e sugere o que enxugar quando não cabe", async () => {
    prepararMock.mockImplementation(async (p: Perfil) =>
      preparadoFalso(p, { coube: false }),
    );
    montar((d) => {
      d.perfil.nomeCompleto = "Ana";
      d.perfil.experiencias = [
        {
          ...criarExperienciaVazia(),
          cargo: "Dev",
          topicos: ["a".repeat(109), "b".repeat(50), ""],
        },
      ];
    });
    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("O CV passa de 1 página");
    expect(alerta).toHaveTextContent(
      "Encurte o tópico 1 da Experiência 1 (109 caracteres).",
    );
    expect(screen.getByText("130% usado")).toBeInTheDocument();
  });
});
