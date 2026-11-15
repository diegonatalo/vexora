import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createEmptyExperience } from "@/lib/schema";
import { readValues, TestForm } from "@/components/editor/test-form";
import { ExperienceSection } from "./experience-section";
import { EducationSection, SkillsSection } from "./list-sections";

const values = () => readValues(screen.getByTestId("values"));

describe("EducationSection", () => {
  it("adiciona, preenche e remove formações", async () => {
    render(
      <TestForm>
        <EducationSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    fireEvent.change(screen.getAllByLabelText("Curso")[1], { target: { value: "ADS" } });
    expect(values().educations).toHaveLength(2);
    expect(values().educations[1].course).toBe("ADS");

    await userEvent.click(screen.getByRole("button", { name: "Remover formação 1" }));
    expect(values().educations).toHaveLength(1);
    expect(values().educations[0].course).toBe("ADS");
  });

  it("'Ainda cursando' desabilita a data de fim", async () => {
    render(
      <TestForm>
        <EducationSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    await userEvent.click(screen.getByLabelText("Ainda cursando"));
    expect(screen.getByLabelText("Fim")).toBeDisabled();
  });
});

describe("SkillsSection", () => {
  it("sem grupos, sugere grupos prontos que somem depois do primeiro", async () => {
    render(
      <TestForm>
        <SkillsSection />
      </TestForm>,
    );
    const suggestions = screen.getByRole("group", { name: "Sugestões de grupos" });
    await userEvent.click(suggestions.querySelector("button")!);
    expect(values().skills).toEqual([{ title: "Competências", items: [], visible: true }]);
    expect(screen.queryByRole("group", { name: "Sugestões de grupos" })).toBeNull();
  });

  it("adiciona e remove idiomas", async () => {
    render(
      <TestForm>
        <SkillsSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar idioma" }));
    fireEvent.change(screen.getByLabelText("Idioma"), { target: { value: "Inglês" } });
    expect(values().languages).toEqual([{ language: "Inglês", level: "", visible: true }]);
    await userEvent.click(screen.getByRole("button", { name: "Remover idioma 1" }));
    expect(values().languages).toEqual([]);
  });
});

describe("ExperienceSection", () => {
  it("a primeira experiência começa aberta e as outras recolhidas, com cargo e empresa", () => {
    const a = { ...createEmptyExperience(), jobTitle: "Dev", company: "ACME" };
    const b = { ...createEmptyExperience(), jobTitle: "Estagiária", company: "Loja" };
    render(
      <TestForm initial={{ experiences: [a, b] }}>
        <ExperienceSection />
      </TestForm>,
    );
    expect(screen.getByRole("button", { name: "Recolher experiência 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Experiência 2.*Estagiária · Loja/ })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("abre e recolhe uma experiência", async () => {
    const a = createEmptyExperience();
    const b = createEmptyExperience();
    render(
      <TestForm initial={{ experiences: [a, b] }}>
        <ExperienceSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Experiência 2/ }));
    expect(screen.getByRole("button", { name: "Recolher experiência 2" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Recolher experiência 1" }));
    expect(screen.queryByRole("button", { name: "Recolher experiência 1" })).toBeNull();
  });

  it("uma experiência nova já aparece aberta para preencher", async () => {
    render(
      <TestForm>
        <ExperienceSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Adicionar experiência" }));
    expect(values().experiences).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Recolher experiência 1" })).toBeInTheDocument();
    expect(screen.getByLabelText("Cargo")).toBeInTheDocument();
  });

  it("remover uma experiência tira ela do formulário", async () => {
    render(
      <TestForm initial={{ experiences: [{ ...createEmptyExperience(), jobTitle: "Dev" }] }}>
        <ExperienceSection />
      </TestForm>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remover experiência 1" }));
    expect(values().experiences).toEqual([]);
  });
});
