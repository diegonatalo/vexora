# Decisões

Registro curto das decisões que não estavam no prompt original.

## Fase 1

- **Versões:** Next.js 16 (App Router), React 19, Tailwind v4, Zod 4, Vitest 5. O Next 16 tem breaking changes; a doc local fica em `node_modules/next/dist/docs/` e vale ler antes de mexer em rotas.
- **Tokens de design em `@theme` (CSS):** o Tailwind v4 não usa mais `tailwind.config`. Os tokens estão em `app/globals.css` e geram classes como `bg-paper`, `text-muted`, `rounded-card`.
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

## Fase 3

- **Modelo intermediário (`CvModel`):** `montarCv(perfil, opcoes)` transforma o `Perfil` em dados prontos para imprimir (datas formatadas, links sem `https://`, tópicos vazios descartados). O `CvDocument` só desenha; a lógica de conteúdo é função pura e testada. As Fases 4 e 5 (ajuste de página, adaptação à vaga) vão operar sobre este modelo.
- **Placeholders só na pré-visualização:** o design mostra `[Seu Nome Completo]` etc. no preview. `montarCv(..., { placeholders: true })` os usa; o PDF baixado omite seções vazias em vez de imprimir colchetes.
- **Pré-visualização = o mesmo PDF do download**, desenhado em `<canvas>` com `pdfjs-dist` (a 1000px de largura, nítido em telas 2x/3x). Escolhi canvas em vez de `<iframe>` porque iOS e vários Androids não exibem PDF em iframe. Desenha em um canvas fora da tela e copia, para não piscar e não conflitar entre renderizações sobrepostas. Debounce de 400ms.
- **Bibliotecas sob demanda:** `react-pdf` e `pdfjs-dist` são importados dinamicamente (`next/dynamic` com `ssr: false` e `import()`), fora do bundle inicial e do servidor.
- **Sem hifenização automática:** o hifenizador padrão do react-pdf é em inglês e partiria palavras ("pro-gramação"). Registrei um callback que nunca hifeniza; há teste.
- **Marcador de lista:** o react-pdf não tem listas nativas; cada tópico é uma linha com `•` e o texto em coluna separada (o texto sai selecionável e na ordem certa).
- **`CvDocument` é chamado como função** (`CvDocument({ cv })`), não como componente JSX, porque `pdf()` e `renderToBuffer()` exigem o elemento `<Document>` na raiz.
- **Testes de PDF em Node:** `renderToBuffer` + `pdfjs-dist/legacy` extraem texto e contam páginas (`tests/pdf-utils.ts`). Passa a pasta `standard_fonts` ao pdfjs, porque a Helvetica não é embutida.
- **"Baixar PDF" desabilitado sem nome** (dica via `title`). A obrigatoriedade de e-mail e telefone continua na Fase 4.
- **Estouro de página:** na Fase 3 o conteúdo que passa de 1 página vira 2 páginas (a legenda da pré-visualização mostra "2 páginas"). O ajuste automático e o aviso são a Fase 4.

## Fase 4

- **Ajuste de página medindo o PDF real, não estimando:** `fit.ts` renderiza o PDF e conta páginas com pdfjs, em vez de estimar altura de texto com métricas de fonte. É exato (inclui quebra de linha de verdade) e usa o mesmo caminho do download. Custo: 1 a 5 renderizações por mudança, depois do debounce de 400ms; como cada nível é igual ou mais compacto que o anterior, a busca é binária (a maioria dos casos usa 1).
- **Níveis de ajuste (`NIVEIS`):** 0 padrão (11pt) → 1 espaçamentos menores → 2 fonte 10,5pt → 3 fonte 10pt → 4 margens 42/46 → 5 margens 36 (mínimo). Segue a ordem do prompt (espaços, fonte de 11 a 10pt, margens até 36). O corpo parte de 11pt (na Fase 3 era 10,5pt, antes de existir o ajuste).
- **Nada é cortado em silêncio:** se nem o nível 5 couber, o CV segue com mais de 1 página, o cartão "Espaço da página" avisa e lista o que enxugar (`sugerirEnxugar`: tópicos mais longos primeiro, depois resumo, habilidades e certificações), e o "Baixar PDF" fica **desabilitado**. Interpretei "dispara o aviso em vez de gerar 2 páginas" como não permitir baixar um PDF de 2 páginas.
- **"% usado" e "linhas restantes" vêm da posição do texto no PDF** (`medicao.ts`): fundo do último texto contra a área útil da página. Passa de 100% quando há mais de 1 página.
- **Checagens são funções puras** (`ats/checks.ts`) que recebem o perfil, o que foi escrito (`CvModel`) e a medição do PDF (texto extraído, páginas, imagens). Retornam `{ id, ok, titulo, problema?, correcao?, severidade? }`; o `problema` e a `correcao` aparecem como no design. Contato sem LinkedIn é `severidade: "aviso"` e conta como não-ok no "N de 8", como no design.
- **Fonte e tabelas:** "Sem imagens" é verificado de verdade (conta operações de imagem no PDF). "Fonte compatível" confere as fontes que o `CvDocument` declara (`fontes.ts`); um teste lê o `/BaseFont` dos bytes do PDF e confirma que só há Helvetica. Tabelas não são detectáveis no PDF; o layout não as usa por construção.
- **E-mail e telefone obrigatórios, mas não bloqueiam o download.** Só bloqueiam: nome vazio e CV acima de 1 página. As demais falhas são avisos na Verificação ATS. (Decisão minha: "obrigatório" do prompt é para o ATS/recrutador; bloquear o botão por um telefone faltando seria agressivo.)
- **Preview = PDF final:** a pré-visualização desenha os mesmos bytes que a análise gerou (com o ajuste já aplicado), sem gerar duas vezes. Placeholders do design só aparecem quando o perfil está totalmente vazio (`perfilSemConteudo`); com qualquer conteúdo, o preview é o que será baixado.
- **Bug achado e corrigido: letter-spacing nos títulos.** Com `letterSpacing: 1`, nos níveis de fonte menor o pdfjs lia "R E S U M O P R O F I S S I O N A L" (letras separadas), o que um ATS também leria. Passou a 0,5 (≈0,05em). Foi achado no navegador pela checagem de títulos; há teste que roda os 6 níveis (os testes anteriores só olhavam o nível 0) e eu confirmei que ele falha com o espaçamento antigo.

## Fase 5

- **Análise 100% determinística, no navegador (`lib/vaga/`):** `normalizar` (minúsculas, sem acentos, sem pontuação; `Next.js` vira `nextjs`), `stopwords` (PT/EN, mais palavras típicas de anúncio), `glossario.json` (termos com sinônimos, editável sem mexer em código) e `analisarVaga`. Sem IA generativa e sem rede: a descrição da vaga nunca sai do navegador.
- **Casamento por palavra inteira, formas mais longas primeiro:** `Tailwind CSS` consome as duas palavras e não conta `CSS` de novo; `rest` solto não casa `APIs REST`. Termos ambíguos (`Go`, `.NET`) usam `apenasSinonimos`, para o termo em si não casar palavras comuns.
- **Termos recorrentes:** palavras fora do glossário que aparecem 2 ou mais vezes na descrição (e não são stopwords) entram como palavras-chave, para cobrir tecnologias que o glossário ainda não conhece.
- **Comparação com o perfil inteiro:** o texto do perfil (menos ids) vira tokens e cada palavra-chave é procurada por sequência de palavras. Isso gera `encontradas` e `naoEncontradas`, e o contador "6 de 9" do design.
- **Nunca acrescenta habilidade:** os ajustes só reordenam (habilidades, tópicos), ocultam (certificações) ou trocam o resumo, e só a pessoa decide. Os chips "Não encontradas" levam ao editor (`/editor?secao=habilidades`) para ela cadastrar o que realmente conhece.
- **Resumo alternativo sem inventar fatos:** monta uma frase com o cargo desejado, os termos que o perfil já cita e o título da vaga, seguida do resumo original quando cabe nos 500 caracteres. Vem desmarcado por padrão.
- **Perfil original intocado:** `aplicarAjustes(perfil, ajustes)` devolve uma cópia; um teste compara o perfil antes e depois. O modelo `Ajustes` (do schema) guarda ids e índices, não texto, então tolera o perfil mudar depois (itens que sumiram são ignorados).
- **Versões:** "Salvar como nova versão" grava `VersaoCv` com `vaga` e `ajustes`. No editor, o seletor de versão passa a aplicar os ajustes à pré-visualização, às checagens e ao PDF baixado, mas a edição continua sempre no perfil original. "Gerar CV para esta vaga" usa o mesmo caminho do editor (`prepararPdf`), então mantém o ajuste para 1 página e se recusa a baixar se estourar.

## Fase 6

- **Acessibilidade medida:** Lighthouse (Edge headless, build de produção) deu 98 em `/vaga` por falta de `<main>`; corrigido, ficou 100 nas duas telas.
- **Estados vazios e erros:** `/vaga` sem análise explica o que fazer; sem palavras-chave reconhecidas e sem ajustes há mensagens próprias; falhas de armazenamento e de PDF mostram texto com ícone (nunca só cor). O editor mostra placeholders do design quando o perfil está vazio.
- **README sem GIF/prints:** não gravei GIF nem capturas nesta sessão; ficam como pendência manual.
- **Deploy:** não publiquei na Vercel (ação externa, depende da conta do usuário). O projeto não precisa de variáveis de ambiente.

## Máscaras de contato

- **Telefone:** formata enquanto digita, no padrão `(xx) xxxxx-xxxx` (celular) ou `(xx) xxxx-xxxx` (fixo, 10 dígitos). Só dígitos entram.
- **LinkedIn e GitHub:** a pessoa pode digitar só o usuário (com ou sem `@`); ao sair do campo vira `https://linkedin.com/in/{usuario}` / `https://github.com/{usuario}`. Se já parece um endereço (tem ponto ou barra), só garante o `https://`. Normaliza no `blur`, não a cada tecla, para não brigar com a digitação.
- **Portfólio:** acrescenta `https://` quando falta.

## Reordenação e tema escuro

- **Arrastar e soltar com `@dnd-kit`** (Experiência, Formação e Certificações): funciona com mouse, toque e teclado (alça "Reordenar…": espaço para pegar, setas, espaço para soltar, Esc cancela), com avisos em português para leitores de tela. Escolhi a biblioteca em vez de HTML5 drag-and-drop nativo, que não funciona em toque nem por teclado. A reordenação usa `move` do `useFieldArray`, então o formulário, a validação e o PDF seguem a nova ordem. A experiência aberta é guardada por id, não por posição, para acompanhar a mudança. A alça some quando há só 1 item. Idiomas ficaram fora (não foi pedido).
- **Tema escuro por tokens:** os mesmos nomes de cor (`--color-paper`, `--color-ink`...) ganham valores novos em `[data-theme="dark"]`. Sem escolha da pessoa vale o modo do sistema (`prefers-color-scheme`). O botão de lua/sol no cabeçalho grava a escolha em `localStorage`; um script no `<head>` aplica o tema antes da primeira pintura (sem flash claro). Texto de botão usa tokens (`on-accent`, `paper`) em vez de `text-white`. A pré-visualização do PDF continua branca: é o papel.

## Nome: Vexora

- A aplicação passou a se chamar **Vexora** (textos, título da página, nome do pacote, nome dos arquivos baixados `vexora-perfil.json` e fallback `cv-vexora.pdf`). Marca: um "V" branco sobre quadrado verde, em `app/icon.svg`, `favicon.ico` (16/32/48) e `apple-icon.png` (180), todos gerados da mesma arte.
- **Chaves de armazenamento mantidas** (`folha:perfil`, `folha:versoes`, `folha:tema`): trocá-las faria quem já usou a app perder o perfil salvo, e a pessoa nunca vê esses nomes. Só trocar com migração.

## SEO

- **Endereço:** `SITE_URL` vem de `NEXT_PUBLIC_SITE_URL`; sem ela, localhost em desenvolvimento e `https://vexoradn.vercel.app` (endereço definido pelo autor) no resto.
- **Sitemap lista `/editor` e `/vaga`**; `/` só redireciona, então fica de fora. Robots libera tudo e aponta para o sitemap.
- **Imagem OG estática** (PNG 1200x630 gerada da mesma arte do favicon), copiada como `twitter-image.png`, com texto alternativo em `.alt.txt`.

## Sem limite de itens e "Exibir no CV"

- **Removi os limites de quantidade** de experiências, formações, certificações e idiomas (no schema e na interface). Continuam só os limites de texto: 3 tópicos por experiência e 110 caracteres por tópico. O que protege a regra de 1 página agora é o ajuste automático (Fase 4): se não couber, avisa e bloqueia o download; a pessoa decide o que cortar.
- **Interruptor "Exibir no CV"** em cada item (inclusive nas experiências recolhidas): liga e desliga sem apagar. Campo `exibir?: boolean` nos itens; **`undefined` conta como exibido**, então dados salvos antes continuam válidos sem migração.
- **Um único ponto de filtro:** `somenteVisiveis(perfil)` devolve uma cópia sem os ocultos. É usado em `montarCv`, no editor (preview, checagens e download), e em `/vaga` (análise de palavras-chave e geração). Item oculto não conta como "no seu CV". Combina com os ajustes da vaga: `perfilParaCv` = visíveis + ajustes.
- **Contador da navegação** passou a "exibidos/total" (ex.: `2/3` = 2 de 3 itens aparecem no CV).

## Contadores e links clicáveis

- **Contador da navegação sem "x/y":** como não há mais limite, mostra só quantos itens existem (`3`) e, se houver ocultos, `2 · 1 oculto`. "Links e portfólio" mantém `n/3`, porque são 3 campos fixos.
- **Links clicáveis no PDF:** e-mail (`mailto:`), telefone (`tel:+55…`) e LinkedIn/GitHub/portfólio (`https://…`) viram anotações de link com o componente `Link` do react-pdf, **mantendo o texto e a aparência de antes** (sem https:// no texto, sem sublinhado nem cor), então a extração de texto do ATS não muda. `CvModel.contato` passou de `string[]` para `{ texto, href? }[]`. Teste lê as anotações de link do PDF com pdfjs e confere URL e área clicável; sem contato, não há links. Placeholders do preview não são clicáveis.

## Navegação sem contadores

- Os contadores à direita das seções foram removidos: a navegação mostra só o nome e o ícone de estado (ativa, concluída, pendente). Seção com todos os itens ocultos conta como pendente.

## Fim da adaptação à vaga

- **Escopo novo:** a Vexora é só um gerador de CV em PDF. Removi a tela `/vaga`, o motor `lib/vaga/` (análise de palavras-chave, glossário, sugestões), as "versões" do CV (`VersaoCv`, `ajustes`, seletor de versão) e o link "Adaptar à vaga". As seções "Fase 5" acima ficam só como histórico.
- **Dados:** o armazenamento guarda apenas o perfil. A chave antiga `folha:versoes` não é mais lida e é apagada em `apagarDados`. Backups antigos (que tinham `versoes`) ainda importam: o campo extra é ignorado.
- **"Exibir no CV" permanece** e é o que controla o que entra no PDF; o filtro é `somenteVisiveis`.

## Recolher experiências

- Cada experiência aberta ganhou o botão **Recolher** (ícone de seta para cima); a recolhida abre ao clicar na linha. Deixei de ter só uma aberta por vez: agora pode haver várias abertas, controladas por um conjunto de ids (acompanham a reordenação). O botão tem nome acessível por item ("Recolher experiência 2") e `aria-expanded`.

## Redesign da interface

- **Direção visual:** superfícies quentes (papel/palco), esmeralda como única cor de destaque, cantos generosos (20px) e sombras suaves em camadas. Tudo vem de tokens em `@theme` (`globals.css`); o tema escuro só redefine os mesmos nomes.
- **Layout em 3 zonas (xl):** navegação de seções à esquerda (sticky, com barra de progresso e passos numerados/concluídos), formulário no centro, e à direita espaço da página + pré-visualização + verificação ATS (sticky). Em telas menores a navegação vira faixa rolável e um seletor fixo "Editar / Prévia" alterna os painéis.
- **Primeiro foco:** a ação principal ("Baixar PDF") fica no cabeçalho fixo, sempre visível; o status de salvamento vira um selo discreto.
- **Componentes:** cartões de item numerados com ações só-ícone (com `aria-label`), interruptor "Exibir no CV", botão de adicionar tracejado e backup como seção plana ao fim do formulário.
- **Acessibilidade mantida:** foco visível, alvos ≥ 44px, `aria-current`/`progressbar`, movimento reduzido respeitado; Lighthouse de acessibilidade 100 no editor.

## Habilidades genéricas (grupos livres)

- **Problema:** as três listas fixas (Linguagens, Frameworks, Ferramentas) só serviam para quem trabalha com tecnologia.
- **Decisão:** `habilidades` virou uma lista de grupos `{ titulo, itens[], exibir? }`. A pessoa nomeia cada grupo ("Atendimento", "Técnicas", "Ferramentas"…), pode reordenar, ocultar com "Exibir no CV" e adicionar quantos quiser. Sem grupos, aparecem sugestões de nomes como atalho.
- **PDF:** a seção chama-se "Habilidades" (antes "Habilidades técnicas") e cada linha sai como `Grupo: item, item`. Grupo sem nome mostra só os itens.
- **Migração:** `lib/migrar.ts` converte o formato antigo (três listas) em grupos ao carregar do navegador e ao importar backups, sem perder dados. O formato do backup continua `formato: 1`.
