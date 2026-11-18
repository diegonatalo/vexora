import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { openEditor, saved } from "./fixtures";

test("salva o perfil no navegador e mantém depois de recarregar", async ({ page }) => {
  await openEditor(page);
  await page.getByLabel("Nome completo").fill("Maria Souza");
  await page.getByLabel("Cargo desejado").fill("Desenvolvedora Front-end");
  await saved(page);

  await page.reload();
  await expect(page.getByLabel("Nome completo")).toHaveValue("Maria Souza");
  await expect(page.getByLabel("Cargo desejado")).toHaveValue("Desenvolvedora Front-end");
});

test("sem nome, não deixa baixar o PDF", async ({ page }) => {
  await openEditor(page);
  await expect(page.getByRole("button", { name: "Baixar PDF" })).toBeDisabled();
});

test("gera e baixa o PDF do currículo", async ({ page }, testInfo) => {
  await openEditor(page);
  await page.getByLabel("Nome completo").fill("João da Silva");
  await page.getByLabel("Cargo desejado").fill("Analista de Dados");
  await saved(page);

  const button = page.getByRole("button", { name: "Baixar PDF" });
  await expect(button).toBeEnabled({ timeout: 15_000 });
  const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
  expect(download.suggestedFilename()).toBe("cv-joao-da-silva.pdf");

  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  const bytes = await readFile(file);
  expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
});
