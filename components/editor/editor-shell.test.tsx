import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom não desenha canvas nem roda react-pdf/pdfjs: a geração real é testada em pdf/*.test.
const { prepareMock } = vi.hoisted(() => ({ prepareMock: vi.fn() }));
vi.mock("@/components/preview/pdf-preview", () => ({
  default: () => <div data-testid="previa" />,
}));
vi.mock("@/lib/pdf/prepare", () => ({ preparePdf: prepareMock }));
vi.mock("@/lib/pdf/generate", () => ({
  fileName: (name: string) => `cv-${name}.pdf`,
}));

import { EditorShell } from "@/components/editor/editor-shell";
import { FIT_LEVELS } from "@/lib/fit";
import { buildCv, SECTION_TITLES } from "@/lib/pdf/cv-model";
import type { Measurement } from "@/types/pdf";
import {
  createEmptyExperience,
  createEmptyProfile,
  type Profile,
} from "@/lib/schema";
import type { AppData } from "@/lib/storage";

/** Resultado de prepararPdf sem gerar PDF de verdade. */
function fakePrepared(
  profile: Profile,
  over: Partial<Measurement> & { fitted?: boolean } = {},
) {
  const cv = buildCv(profile);
  const { fitted = true, ...measurement } = over;
  return {
    cv,
    layoutFit: FIT_LEVELS[0],
    fitted,
    bytes: new Uint8Array([37, 80, 68, 70]),
    measurement: {
      pages: fitted ? 1 : 2,
      text: [cv.name, ...Object.values(SECTION_TITLES)]
        .map((x) => x.toUpperCase())
        .join("\n"),
      images: 0,
      usedPct: fitted ? 78 : 130,
      freeLines: fitted ? 5 : 0,
      ...measurement,
    },
  };
}

beforeEach(() => {
  prepareMock.mockReset();
  prepareMock.mockImplementation(async (p: Profile) => fakePrepared(p));
});

function build(adjust?: (d: AppData) => void) {
  const profile = createEmptyProfile();
  const data: AppData = { profile };
  adjust?.(data);
  const onChange = vi.fn();
  const user = userEvent.setup();
  render(
    <EditorShell initialData={data} state="saved" onChange={onChange} />,
  );
  return { user, onChange };
}

const jumpTo = (u: ReturnType<typeof userEvent.setup>, section: string) =>
  u.click(
    within(screen.getByRole("navigation", { name: "Seções" })).getByRole(
      "button",
      { name: new RegExp(section) },
    ),
  );

describe("navegação", () => {
  it("troca de seção pelo menu e pelos botões, movendo o foco ao título", async () => {
    const { user } = build();
    expect(
      screen.getByRole("heading", { level: 1, name: "Dados pessoais" }),
    ).toBeInTheDocument();

    await jumpTo(user, "Resumo");
    const title = screen.getByRole("heading", { level: 1, name: "Resumo" });
    expect(title).toHaveFocus();

    await jumpTo(user, "Experiência");
    expect(
      screen.getByRole("heading", { level: 1, name: "Experiência" }),
    ).toBeInTheDocument();

    // Botões de rodapé: próxima e anterior.
    await user.click(screen.getByRole("button", { name: "Formação" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Formação" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Experiência" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Experiência" }),
    ).toHaveFocus();
  });

  it("marca a seção ativa com aria-current", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [createEmptyExperience()];
    });
    await jumpTo(user, "Experiência");
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
    const { user } = build((d) => {
      d.profile.experiences = [createEmptyExperience()];
    });
    await jumpTo(user, "Experiência");

    const field = screen.getByRole("textbox", { name: /Tópico 1/ });
    expect(field).toHaveAccessibleName("Tópico 1 · 0/110");

    await user.click(field);
    await user.paste("x".repeat(111));
    await user.tab();

    expect(field).toHaveAccessibleName("Tópico 1 · 111/110");
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription(/no máximo 110 caracteres/);
  });

  it("valida data fora do padrão ao sair do campo", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [createEmptyExperience()];
    });
    await jumpTo(user, "Experiência");

    const start = screen.getByRole("textbox", { name: "Início" });
    await user.type(start, "132022");
    expect(start).toHaveValue("13/2022");
    await user.tab();
    expect(start).toBeInvalid();
    expect(start).toHaveAccessibleDescription(/MM\/AAAA/);
  });

  it("desabilita o fim quando é o trabalho atual", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [createEmptyExperience()];
    });
    await jumpTo(user, "Experiência");
    await user.click(
      screen.getByRole("checkbox", { name: "Trabalho aqui atualmente" }),
    );
    expect(screen.getByRole("textbox", { name: "Fim" })).toBeDisabled();
  });

  it("não limita a quantidade de experiências", async () => {
    const { user } = build();
    await jumpTo(user, "Experiência");
    for (let i = 0; i < 5; i++) {
      await user.click(
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
    const { user, onChange } = build((d) => {
      d.profile.certifications = [
        { id: "c1", name: "Curso A", institution: "X", year: "2023" },
        { id: "c2", name: "Curso B", institution: "Y", year: "2022" },
      ];
    });
    await jumpTo(user, "Certificações");
    const box = screen.getByRole("checkbox", {
      name: "Exibir certificação 2 no CV",
    });
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
    const last = onChange.mock.calls.at(-1)![0];
    expect(last.profile.certifications).toHaveLength(2);
    expect(last.profile.certifications[1].visible).toBe(false);
    expect(last.profile.certifications[0].visible).not.toBe(false);
  });

  it("recolhe as demais experiências e abre ao clicar", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [
        { ...createEmptyExperience(), jobTitle: "Dev" },
        { ...createEmptyExperience(), jobTitle: "Estagiário" },
      ];
    });
    await jumpTo(user, "Experiência");
    expect(screen.getAllByRole("textbox", { name: "Cargo" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Estagiário/ }));
    const jobTitles = screen.getAllByRole("textbox", { name: "Cargo" });
    expect(jobTitles.map((c) => (c as HTMLInputElement).value)).toContain(
      "Estagiário",
    );
  });

  it("recolhe e exibe de novo uma experiência pelo botão", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [{ ...createEmptyExperience(), jobTitle: "Dev" }];
    });
    await jumpTo(user, "Experiência");
    await user.click(
      screen.getByRole("button", { name: "Recolher experiência 1" }),
    );
    expect(
      screen.queryByRole("textbox", { name: "Cargo" }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Experiência 1/ }));
    expect(screen.getByRole("textbox", { name: "Cargo" })).toHaveValue("Dev");
  });

  it("permite várias experiências abertas ao mesmo tempo", async () => {
    const { user } = build((d) => {
      d.profile.experiences = [
        { ...createEmptyExperience(), jobTitle: "Dev" },
        { ...createEmptyExperience(), jobTitle: "Estagiário" },
      ];
    });
    await jumpTo(user, "Experiência");
    await user.click(screen.getByRole("button", { name: /Estagiário/ }));
    expect(screen.getAllByRole("textbox", { name: "Cargo" })).toHaveLength(2);
  });
});

describe("persistência", () => {
  it("emite o perfil alterado a cada edição", async () => {
    const { user, onChange } = build();
    await user.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({ fullName: "Ana" }),
      }),
    );
  });

  it("salva também rascunhos com campo inválido", async () => {
    const { user, onChange } = build();
    await user.type(screen.getByRole("textbox", { name: "E-mail" }), "ana@");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({ email: "ana@" }),
      }),
    );
  });
});

describe("habilidades", () => {
  it("aceita vírgulas e espaços ao digitar e salva como lista", async () => {
    const { user, onChange } = build();
    await jumpTo(user, "Habilidades");
    await user.click(
      screen.getByRole("button", { name: "Adicionar grupo de habilidades" }),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Nome do grupo" }),
      "Atendimento",
    );
    const field = screen.getByRole("textbox", { name: "Habilidades" });
    await user.type(field, "TypeScript, C#, ");
    expect(field).toHaveValue("TypeScript, C#, ");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        profile: expect.objectContaining({
          skills: [
            expect.objectContaining({
              title: "Atendimento",
              items: ["TypeScript", "C#"],
            }),
          ],
        }),
      }),
    );
  });
});

describe("baixar PDF", () => {
  it("fica desabilitado sem nome e habilita ao preencher", async () => {
    const { user } = build();
    const button = screen.getByRole("button", { name: "Baixar PDF" });
    expect(button).toBeDisabled();
    await user.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    expect(button).toBeEnabled();
  });

  it("prepara o PDF com o perfil atual ao clicar e baixa o arquivo", async () => {
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const { user } = build();
    await user.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    prepareMock.mockClear();
    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));
    expect(prepareMock).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Ana" }),
    );
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it("avisa quando a geração falha", async () => {
    const { user } = build();
    await user.type(
      screen.getByRole("textbox", { name: "Nome completo" }),
      "Ana",
    );
    prepareMock.mockRejectedValueOnce(new Error("falhou"));
    await user.click(screen.getByRole("button", { name: "Baixar PDF" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível gerar o PDF",
    );
  });

  it("não baixa se o CV passa de 1 página e explica o motivo", async () => {
    prepareMock.mockImplementation(async (p: Profile) =>
      fakePrepared(p, { fitted: false }),
    );
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    build((d) => {
      d.profile.fullName = "Ana";
    });
    // A análise (com debounce) marca que não cabe e bloqueia o botão.
    await screen.findByRole("alert", {}, { timeout: 2000 });
    const button = screen.getByRole("button", { name: "Baixar PDF" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("title", expect.stringContaining("1 página"));
    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });
});

describe("verificação ATS e espaço da página", () => {
  it("mostra o resultado das checagens e o uso da página", async () => {
    build((d) => {
      d.profile.fullName = "Ana";
      d.profile.email = "ana@exemplo.com";
      d.profile.phone = "(11) 90000-0000";
      d.profile.links.linkedin = "https://linkedin.com/in/ana";
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
    build((d) => {
      d.profile.fullName = "Ana";
      d.profile.email = "ana@exemplo.com";
      d.profile.phone = "(11) 90000-0000";
    });
    expect(await screen.findByText("7 de 8 ok")).toBeInTheDocument();
    expect(screen.getByText("Sem link do LinkedIn.")).toBeInTheDocument();
    expect(
      screen.getByText(/Adicione em Links e portfólio\./),
    ).toBeInTheDocument();
  });

  it("atualiza as checagens de contato na hora, sem esperar o PDF", async () => {
    const { user } = build((d) => {
      d.profile.fullName = "Ana";
    });
    await screen.findByText(/de 8 ok/);
    expect(screen.getByText("Falta e-mail e telefone.")).toBeInTheDocument();
    await user.type(
      screen.getByRole("textbox", { name: "E-mail" }),
      "ana@exemplo.com",
    );
    expect(screen.getByText("Falta telefone.")).toBeInTheDocument();
  });

  it("avisa e sugere o que enxugar quando não cabe", async () => {
    prepareMock.mockImplementation(async (p: Profile) =>
      fakePrepared(p, { fitted: false }),
    );
    build((d) => {
      d.profile.fullName = "Ana";
      d.profile.experiences = [
        {
          ...createEmptyExperience(),
          jobTitle: "Dev",
          bullets: ["a".repeat(109), "b".repeat(50), ""],
        },
      ];
    });
    const alertMessage = await screen.findByRole("alert");
    expect(alertMessage).toHaveTextContent("O CV passa de 1 página");
    expect(alertMessage).toHaveTextContent(
      "Encurte o tópico 1 da Experiência 1 (109 caracteres).",
    );
    expect(screen.getByText("130% usado")).toBeInTheDocument();
  });
});
