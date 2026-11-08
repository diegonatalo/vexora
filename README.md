# Vexora

Cadastre seu perfil uma vez e baixe um **CV de 1 página otimizado para ATS**
(sistemas que leem currículos). Cole a descrição de uma vaga e a Vexora compara
as palavras-chave com o seu perfil e reorganiza o CV para ela.

- **Sem backend, sem login, sem IA generativa.** Tudo roda no navegador.
- **Privacidade (LGPD):** seus dados ficam só neste navegador (IndexedDB). Nada é
  enviado a servidor. Há exportar/importar em JSON para backup.
- Interface em português do Brasil.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + testes
npm run build      # build de produção
```

Requer Node 22+.

## Telas

- `/editor`: formulário por seções, verificação ATS, espaço da página e
  pré-visualização do PDF final. Botão "Baixar PDF".
- `/vaga`: cola a descrição, vê palavras-chave encontradas e ausentes, escolhe
  ajustes e gera o CV ou salva como nova versão. O perfil original não muda.

## Decisões de ATS

- PDF de **1 coluna, só texto**, fonte padrão (Helvetica), sem imagens, ícones
  nem tabelas; títulos de seção padrão ("Experiência", "Formação"...).
- O PDF é gerado como texto selecionável (`@react-pdf/renderer`) e **lido de
  volta com `pdfjs-dist`**: as checagens e a contagem de páginas usam o arquivo
  real, não uma estimativa.
- Ajuste automático para **1 página** (espaçamento, fonte de 11 a 10pt e margens
  até 36pt). Se mesmo assim não couber, o download é bloqueado e há sugestões do
  que enxugar.
- Adaptação à vaga é determinística (`src/lib/vaga/`): glossário editável
  (`glossario.json`) com sinônimos, nunca acrescenta habilidade que você não
  cadastrou.

Todas as decisões, com o porquê, estão em [`docs/decisions.md`](docs/decisions.md).

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS v4, Zod, React Hook Form,
`idb-keyval`, `@react-pdf/renderer`, `pdfjs-dist`, Vitest + Testing Library.

## Estrutura

```
src/app/          rotas (/editor, /vaga)
src/components/   editor, vaga, preview, ui
src/lib/          schema, storage, pdf, ats, vaga
src/pdf/          documento do CV (react-pdf)
docs/decisions.md decisões de projeto
```

## Acessibilidade

Lighthouse (acessibilidade): **100** em `/editor` e `/vaga` (build de produção).

## SEO e compartilhamento

- `sitemap.xml` e `robots.txt` são gerados por `src/app/sitemap.ts` e `src/app/robots.ts`.
- Open Graph e Twitter Card: título, descrição e imagem (`opengraph-image.png`,
  1200x630) definidos em `src/app/layout.tsx`; `/editor` e `/vaga` têm título próprio.
- O endereço público vem de `src/lib/site.ts`: `NEXT_PUBLIC_SITE_URL` se definida;
  em desenvolvimento, `http://localhost:3000`; no resto, `https://vexoradn.vercel.app`.
- Favicon: `icon.svg`, `favicon.ico` e `apple-icon.png` em `src/app/`.

## Deploy

Endereço: <https://vexoradn.vercel.app>. Sem variáveis obrigatórias. Na Vercel: importar o repositório e usar as
configurações padrão do Next.js. Para um domínio próprio, defina
`NEXT_PUBLIC_SITE_URL` (ex.: `https://vexora.app`, se um dia trocar o domínio) para o sitemap e as imagens
de compartilhamento apontarem para ele.

## Repositório

<https://github.com/diegonatalo/vexora>
