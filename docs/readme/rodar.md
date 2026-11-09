Requer [Node.js](https://nodejs.org) 22 ou superior.

```bash
git clone https://github.com/diegonatalo/vexora.git
cd vexora
pnpm install
pnpm dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Gera o build de produção |
| `pnpm start` | Serve o build de produção |
| `pnpm lint` | Roda o ESLint |
| `pnpm typecheck` | Confere os tipos do TypeScript |
| `pnpm test` | Roda os testes uma vez |
| `pnpm test:watch` | Roda os testes e reexecuta ao salvar |
| `pnpm format` | Formata o código com o Prettier |
| `pnpm check` | Roda typecheck, lint e testes em sequência |

### 🔑 Variáveis de ambiente

Nenhuma é obrigatória. `NEXT_PUBLIC_SITE_URL` é opcional: define o endereço público usado no sitemap, no robots e nas imagens de compartilhamento.
