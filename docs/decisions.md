# Decisões

Registro curto das decisões que não estavam no prompt original.

## Fase 1

- **Versões:** Next.js 16 (App Router), React 19, Tailwind v4, Zod 4, Vitest 5. O Next 16 tem breaking changes; a doc local fica em `node_modules/next/dist/docs/` e vale ler antes de mexer em rotas.
- **Tokens de design em `@theme` (CSS):** o Tailwind v4 não usa mais `tailwind.config`. Os tokens estão em `src/app/globals.css` e geram classes como `bg-paper`, `text-muted`, `rounded-card`.
- **Armazenamento:** IndexedDB via `idb-keyval`, com duas chaves (`folha:perfil`, `folha:versoes`). Ao carregar, o dado é validado com Zod; se estiver inválido, cai para um perfil vazio em vez de quebrar.
- **Schema aceita rascunho:** campos de texto e datas aceitam `""` porque o perfil é salvo enquanto a pessoa preenche. O que estiver preenchido precisa ser válido (regex `MM/AAAA`, e-mail, URL, `inicio <= fim`). A obrigatoriedade (e-mail, telefone, datas) é cobrada pelas checagens de ATS (Fase 4), não pelo schema.
- **Ids nos itens:** experiências, formações e certificações têm `id` (UUID) para que `VersaoCv.ajustes` (destaques, certificações ocultas) referencie itens sem depender da posição.
- **Formação com `atual`:** mesmo formato de período da experiência, para exibir "Atual" em cursos em andamento.
- **Formato do backup:** `{ formato: 1, exportadoEm, perfil, versoes }`. O campo `formato` permite migrar no futuro.
- **`@types/node` 24:** o Vitest 5 exige `@types/node` 22 ou superior; subi do 20 do scaffold para o 24, a mesma major do Node usado.
- **Tela `/editor` provisória:** na Fase 1 ela só prova persistência e exportar/importar. O layout de 3 colunas vem na Fase 2.
