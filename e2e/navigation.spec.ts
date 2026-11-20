import { expect, test } from "@playwright/test";
import { openEditor } from "./fixtures";

test("a página inicial apresenta o Vexora e leva ao editor", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/passa pelo robô/);
  await page.getByRole("link", { name: "Criar meu currículo" }).first().click();
  await expect(page).toHaveURL("/app");
  await expect(page.getByLabel("Nome completo")).toBeVisible();
  // A marca no editor volta para a página inicial.
  await page.getByRole("link", { name: "Vexora, página inicial" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("o endereço antigo do editor redireciona para /app", async ({ page, request }) => {
  const response = await request.get("/editor", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/app");
  await page.goto("/editor");
  await expect(page).toHaveURL("/app");
});

for (const { path, heading } of [
  { path: "/privacidade", heading: "Privacidade" },
  { path: "/termos", heading: "Termos de uso" },
]) {
  test(`abre ${path} pelo rodapé sem erros no console`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: heading }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

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
  await expect(page).toHaveURL("/");
});
