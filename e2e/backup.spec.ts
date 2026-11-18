import { expect, test } from "@playwright/test";
import { openEditor, saved } from "./fixtures";

test("exporta o perfil e importa em outro navegador", async ({ page, browser }, testInfo) => {
  await openEditor(page);
  await page.getByLabel("Nome completo").fill("Ana Pereira");
  await page.getByLabel("Cargo desejado").fill("Designer de Produto");
  await saved(page);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar (JSON)" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("vexora-perfil.json");
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);

  // Outro contexto é outro navegador: IndexedDB vazio, como num computador novo.
  const other = await browser.newContext();
  const fresh = await other.newPage();
  await openEditor(fresh);
  await expect(fresh.getByLabel("Nome completo")).toHaveValue("");

  await fresh.getByLabel("Arquivo de perfil JSON").setInputFiles(file);
  await expect(fresh.getByText("Perfil importado.")).toBeVisible();
  await expect(fresh.getByLabel("Nome completo")).toHaveValue("Ana Pereira");
  await expect(fresh.getByLabel("Cargo desejado")).toHaveValue("Designer de Produto");

  // O perfil importado fica salvo nesse navegador também.
  await saved(fresh);
  await fresh.reload();
  await expect(fresh.getByLabel("Nome completo")).toHaveValue("Ana Pereira");
  await other.close();
});

test("recusa um arquivo que não é perfil", async ({ page }) => {
  await openEditor(page);
  await page.getByLabel("Arquivo de perfil JSON").setInputFiles({
    name: "qualquer.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"nada": true}'),
  });
  await expect(page.getByText("Perfil importado.")).toHaveCount(0);
  await expect(page.getByLabel("Nome completo")).toHaveValue("");
});
