Requer [Node.js](https://nodejs.org) 22 ou superior.

```bash
git clone https://github.com/diegonatalo/vexora.git
cd vexora
npm install
npm run dev        # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Serve o build de produção |
| `npm run lint` | Roda o ESLint |
| `npm run typecheck` | Confere os tipos do TypeScript |
| `npm run test` | Roda os testes uma vez |
| `npm run test:watch` | Roda os testes e reexecuta ao salvar |
| `npm run format` | Formata o código com o Prettier |
| `npm run check` | Roda typecheck, lint e testes em sequência |

### 🔑 Variáveis de ambiente

Nenhuma é obrigatória. `NEXT_PUBLIC_SITE_URL` é opcional: define o endereço público usado no sitemap, no robots e nas imagens de compartilhamento.
