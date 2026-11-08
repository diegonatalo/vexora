import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditorShell } from "@/components/editor/EditorShell";
import {
  criarExperienciaVazia,
  criarPerfilVazio,
  criarVersaoPadrao,
  LIMITES,
} from "@/lib/schema";
import type { Dados } from "@/lib/storage";

function montar(ajustar?: (d: Dados) => void) {
  const perfil = criarPerfilVazio();
  const dados: Dados = { perfil, versoes: [criarVersaoPadrao(perfil)] };
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

  it("marca a seção ativa com aria-current e mostra contadores", async () => {
    const { usuario } = montar((d) => {
      d.perfil.experiencias = [criarExperienciaVazia()];
    });
    await irPara(usuario, "Experiência");
    const item = screen.getByRole("button", { name: /^Experiência/ });
    expect(item).toHaveAttribute("aria-current", "step");
    expect(item).toHaveTextContent("1/3");
    expect(
      screen.getByRole("button", { name: /^Certificações/ }),
    ).toHaveTextContent("vazio");
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

  it(`limita a ${LIMITES.experiencias} experiências`, async () => {
    const { usuario } = montar();
    await irPara(usuario, "Experiência");
    const adicionar = () =>
      usuario.click(
        screen.getByRole("button", { name: "Adicionar experiência" }),
      );
    await adicionar();
    await adicionar();
    await adicionar();
    expect(
      screen.queryByRole("button", { name: "Adicionar experiência" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Limite de 3 experiências para manter 1 página"),
    ).toBeInTheDocument();
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
    expect(screen.getByRole("textbox", { name: "Cargo" })).toHaveValue(
      "Estagiário",
    );
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
    const campo = screen.getByRole("textbox", { name: "Linguagens" });
    await usuario.type(campo, "TypeScript, C#, ");
    expect(campo).toHaveValue("TypeScript, C#, ");
    expect(onAlterar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        perfil: expect.objectContaining({
          habilidades: expect.objectContaining({
            linguagens: ["TypeScript", "C#"],
          }),
        }),
      }),
    );
  });
});
