### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev) com Testing Library. Os testes cobrem o schema e o armazenamento dos currículos, as regras de seções e visibilidade, as máscaras, a medição e o modelo do PDF, as verificações de ATS e os fluxos do editor e do PDF.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros: salvar o perfil e recarregar, gerar e baixar o PDF de verdade, exportar o perfil e importar em outro navegador, abrir o editor sem erros, ir da landing ao editor, o redirecionamento de `/editor` e as páginas de privacidade e termos.

Os prints da landing (`public/landing/`) saem de um teste à parte, com um perfil fictício: `SCREENSHOTS=1 pnpm test:e2e e2e/screenshots.spec.ts` (depois, converta os PNG para WebP).

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```
