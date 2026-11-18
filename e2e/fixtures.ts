import { expect, type Page } from "@playwright/test";

/** Abre o editor e espera o perfil carregar do IndexedDB. */
export const openEditor = async (page: Page) => {
  await page.goto("/editor");
  await expect(page.getByLabel("Nome completo")).toBeVisible();
};

/** Indicador de salvamento do topo do editor. */
export const saved = (page: Page) =>
  expect(page.getByRole("status").filter({ hasText: "Salvo neste navegador" })).toBeVisible();
