### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev) com Testing Library. Os testes cobrem o schema e o armazenamento dos currículos, as regras de seções e visibilidade, as máscaras, a medição e o modelo do PDF, as verificações de ATS e os fluxos do editor e do PDF.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros: salvar o perfil e recarregar, gerar e baixar o PDF de verdade, exportar o perfil e importar em outro navegador, e abrir o editor sem erros.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```
