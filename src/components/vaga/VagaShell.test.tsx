import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VagaShell } from "@/components/vaga/VagaShell";
import { criarPerfilVazio, criarVersaoPadrao } from "@/lib/schema";
import type { Dados } from "@/lib/storage";

const DESCRICAO =
  "Dev Front-end — Acme\nRequisitos:\n- React, TypeScript e Next.js\n- Tailwind CSS\n- Git e APIs REST\n- Testes automatizados\n- Docker\n- Metodologias ágeis";

function dadosDeTeste(): Dados {
  const perfil = {
    ...criarPerfilVazio(),
    nomeCompleto: "Ana Souza",
    resumo:
      "Trabalho com React, TypeScript, Next.js, Tailwind CSS, Git e APIs REST.",
  };
  return { perfil, versoes: [criarVersaoPadrao(perfil)] };
}

describe("VagaShell", () => {
  it("mostra '6 de 9 no seu perfil' e não altera o perfil", async () => {
    const dados = dadosDeTeste();
    const copia = structuredClone(dados);
    const user = userEvent.setup();
    render(<VagaShell dados={dados} onSalvarVersoes={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Analisar vaga" }));
    expect(
      screen.getByRole("textbox", { name: "Descrição da vaga" }),
    ).toBeInvalid();

    await user.type(
      screen.getByRole("textbox", { name: "Descrição da vaga" }),
      "{Control>}a{/Control}",
    );
    await user.paste(DESCRICAO);
    await user.click(screen.getByRole("button", { name: "Analisar vaga" }));

    expect(screen.getByText(/6 de 9 no seu perfil/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "No seu CV" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Não encontradas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(dados).toEqual(copia);
  });

  it("salva uma nova versão com a vaga e os ajustes marcados", async () => {
    const dados = dadosDeTeste();
    const aoSalvar = vi.fn();
    const user = userEvent.setup();
    render(<VagaShell dados={dados} onSalvarVersoes={aoSalvar} />);

    await user.click(
      screen.getByRole("textbox", { name: "Descrição da vaga" }),
    );
    await user.paste(DESCRICAO);
    await user.click(screen.getByRole("button", { name: "Analisar vaga" }));
    await user.click(
      screen.getByRole("button", { name: "Salvar como nova versão" }),
    );

    expect(aoSalvar).toHaveBeenCalledTimes(1);
    const versoes = aoSalvar.mock.calls[0][0];
    expect(versoes).toHaveLength(2);
    expect(versoes[0]).toEqual(dados.versoes[0]);
    expect(versoes[1]).toMatchObject({
      nome: "Dev Front-end — Acme",
      perfilId: dados.perfil.id,
      vaga: { titulo: "Dev Front-end", empresa: "Acme" },
    });
  });
});
