import { expect, test } from "@playwright/test";
import { openEditor } from "./fixtures";

test("a página inicial leva ao editor", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/editor");
  await expect(page.getByLabel("Nome completo")).toBeVisible();
});

test("abre o editor sem erros no console", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await openEditor(page);
  await page.getByLabel("Nome completo").fill("Teste");
  // Dá tempo de a prévia do PDF renderizar, que é onde erros costumam aparecer.
  await page.waitForTimeout(2_000);
  expect(errors).toEqual([]);
});

test("endereço desconhecido mostra a página 404", async ({ page }) => {
  const response = await page.goto("/nao-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao início" }).click();
  await expect(page).toHaveURL("/editor");
});
