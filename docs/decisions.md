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

## Fase 2

- **Um único formulário (React Hook Form + `zodResolver(perfilSchema)`):** as seções são só telas diferentes do mesmo `useForm`, com `FormProvider`. Isso mantém os valores ao trocar de seção e usa o schema como única fonte de validação.
- **Validação `onTouched`:** o erro aparece ao sair do campo e depois revalida a cada tecla. Datas e e-mails não ficam "vermelhos" enquanto a pessoa ainda digita.
- **Rascunhos sempre salvos, mesmo inválidos:** `form.subscribe` grava a cada edição. Ao carregar, `sanitizar.ts` esvazia só os campos inválidos (ou corta textos acima do limite) em vez de descartar o perfil. Há teste para isso.
- **Máscara `MM/AAAA`:** `CampoMesAno` formata a digitação (`032022` vira `03/2022`).
- **Habilidades como lista por vírgula:** o texto digitado fica em estado local do campo; dividir por vírgula a cada tecla engoliria a vírgula e o espaço recém-digitados.
- **Idiomas ficam na seção Habilidades** (limite 4): o design não tem seção própria para eles.
- **Experiências recolhidas:** só uma fica aberta; as demais mostram `Cargo · Empresa` e um aviso ("Data fora do padrão" ou "Revise os campos") quando há erro.
- **Ordem no celular:** navegação, formulário, depois os cartões laterais (Verificação ATS, Backup, Espaço da página, Pré-visualização). No desktop são 3 colunas (264px, flexível, 380px) via grid com posições explícitas.
- **Foco ao trocar de seção:** vai para o título (`#secao-titulo`), para teclado e leitores de tela.
- **Cartões "chegam na Fase N":** Verificação ATS (Fase 4), Espaço da página (Fase 4) e Pré-visualização (Fase 3) são marcadores de posição; "Baixar PDF" está desabilitado até a Fase 3. `/vaga` é uma página provisória (Fase 5).
- **Seletor de versão:** já é um `<select>` ligado às versões salvas, mas só existe a "CV geral" até a Fase 5.
