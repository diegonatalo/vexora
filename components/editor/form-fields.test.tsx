import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddItem, CardItem, ListField, MonthYearField, VisibilityToggle } from "./form-fields";
import { readValues, TestForm } from "./test-form";

const values = () => readValues(screen.getByTestId("values"));

describe("MonthYearField", () => {
  it("aplica a máscara MM/AAAA enquanto a pessoa digita", async () => {
    render(
      <TestForm initial={{ experiences: [{ id: "e", jobTitle: "", company: "", start: "", end: "", current: false, visible: true, bullets: [] }] }}>
        <MonthYearField name="experiences.0.start" label="Início" />
      </TestForm>,
    );
    await userEvent.type(screen.getByLabelText("Início"), "032024");
    expect(screen.getByLabelText("Início")).toHaveValue("03/2024");
    expect(values().experiences[0].start).toBe("03/2024");
  });
});

describe("ListField", () => {
  it("transforma o texto separado por vírgulas em lista, sem engolir o que está sendo digitado", async () => {
    render(
      <TestForm initial={{ skills: [{ title: "Ferramentas", items: [], visible: true }] }}>
        <ListField name="skills.0.items" label="Habilidades" />
      </TestForm>,
    );
    const input = screen.getByLabelText("Habilidades");
    await userEvent.type(input, "Git, Docker, ");
    expect(input).toHaveValue("Git, Docker, ");
    expect(values().skills[0].items).toEqual(["Git", "Docker"]);
  });

  it("mostra a lista salva separada por vírgulas", () => {
    render(
      <TestForm initial={{ skills: [{ title: "T", items: ["React", "Node"], visible: true }] }}>
        <ListField name="skills.0.items" label="Habilidades" />
      </TestForm>,
    );
    expect(screen.getByLabelText("Habilidades")).toHaveValue("React, Node");
  });
});

describe("VisibilityToggle", () => {
  it("item sem a marca conta como exibido e o interruptor desliga", async () => {
    render(
      <TestForm initial={{ languages: [{ language: "Inglês", level: "B2" } as never] }}>
        <VisibilityToggle name="languages.0.visible" label="Exibir idioma 1 no CV" />
      </TestForm>,
    );
    const toggle = screen.getByRole("checkbox", { name: "Exibir idioma 1 no CV" });
    expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    expect(values().languages[0].visible).toBe(false);
  });
});

describe("CardItem", () => {
  it("mostra o número do título e os botões de recolher e remover com nome acessível", async () => {
    const onRemove = vi.fn();
    const onCollapse = vi.fn();
    render(
      <CardItem title="Experiência 2" removeLabel="Remover experiência 2" onRemove={onRemove} onCollapse={onCollapse} collapseLabel="Recolher experiência 2">
        <p>conteúdo</p>
      </CardItem>,
    );
    expect(screen.getByRole("group", { name: "Experiência 2" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Recolher experiência 2" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover experiência 2" }));
    expect(onCollapse).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
  });

  it("sem as ações, não mostra os botões", () => {
    render(
      <CardItem title="Idioma 1" removeLabel="Remover idioma 1">
        <p>conteúdo</p>
      </CardItem>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("AddItem", () => {
  it("chama a ação ao clicar", async () => {
    const onAdd = vi.fn();
    render(<AddItem addText="Adicionar idioma" onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: "Adicionar idioma" }));
    expect(onAdd).toHaveBeenCalled();
  });
});
