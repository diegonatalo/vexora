import { expect, test } from "@playwright/test";
import { createEmptyProfile, type Backup } from "@/lib/schema";
import { openEditor, saved } from "./fixtures";

// Gera os prints da landing em public/landing/. Fica fora da suíte normal:
// rode com `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts`.
test.skip(!process.env.SCREENSHOTS, "só com SCREENSHOTS=1");

/** Perfil de exemplo (pessoa fictícia) para os prints. */
const sampleBackup = (): Backup => {
  const profile = createEmptyProfile();
  profile.fullName = "Marina Duarte";
  profile.desiredJobTitle = "Analista de Dados";
  profile.cityState = "Curitiba, PR";
  profile.phone = "(41) 99999-0000";
  profile.email = "marina@exemplo.com";
    profile.summary =
    "Analista de dados com 5 anos de experiência em varejo, transformando vendas e estoque em painéis que guiam decisões de compra.";
  profile.experiences = [
    {
      id: "e1",
      jobTitle: "Analista de Dados Pleno",
      company: "Rede Exemplo de Supermercados",
      cityState: "Curitiba/PR",
      start: "03/2022",
      end: "",
      current: true,
      visible: true,
      bullets: [
        "Criei painéis de vendas por loja usados pelos 40 gerentes da rede toda semana.",
        "Reduzi em 18% a ruptura de estoque com um modelo de previsão de demanda.",
        "Automatizei o relatório mensal da diretoria, que levava dois dias para ficar pronto.",
      ],
    },
    {
      id: "e2",
      jobTitle: "Assistente de BI",
      company: "Exemplo Distribuidora",
      cityState: "São José dos Pinhais/PR",
      start: "01/2020",
      end: "02/2022",
      current: false,
      visible: true,
      bullets: [
        "Montei a base de clientes única a partir de três sistemas diferentes.",
        "Treinei a equipe comercial para usar os painéis de metas.",
        "",
      ],
    },
  ];
  profile.educations = [
    {
      id: "f1",
      course: "Bacharelado em Estatística",
      institution: "Universidade Federal Exemplo",
      start: "02/2015",
      end: "12/2019",
      current: false,
      visible: true,
    },
  ];
  profile.certifications = [
    { id: "c1", name: "Análise de Dados com SQL", institution: "Escola Exemplo", year: "2023", visible: true },
  ];
  profile.skills = [
    { title: "Técnicas", items: ["SQL", "Python", "Power BI", "Estatística"], visible: true },
    { title: "Ferramentas", items: ["Excel", "Git", "BigQuery"], visible: true },
  ];
  profile.languages = [
    { language: "Português", level: "nativo", visible: true },
    { language: "Inglês", level: "avançado", visible: true },
  ];
  return { format: 1, exportedAt: new Date().toISOString(), profile };
};

for (const scheme of ["light", "dark"] as const) {
  test(`print do editor (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await openEditor(page);
    await page.getByLabel("Arquivo de perfil JSON").setInputFiles({
      name: "exemplo.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(sampleBackup())),
    });
    await expect(page.getByLabel("Nome completo")).toHaveValue("Marina Duarte");
    await saved(page);
    // Dá tempo de a prévia do PDF renderizar.
    await page.waitForTimeout(3_000);
    await page.evaluate(() => window.scrollTo(0, 0));
    const name = scheme === "light" ? "editor-claro" : "editor-escuro";
    await page.screenshot({ path: `public/landing/${name}.png` });
  });
}
