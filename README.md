<!-- Arquivo gerado pelo readme-kit. Não edite aqui: altere docs/readme/ e rode "readme-kit build". -->
<div align="center">

<img src="docs/assets/banner.svg" alt="Vexora: Cadastre seu perfil uma vez e baixe um CV de 1 página otimizado para ATS. github.com/diegonatalo/vexora. Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4" width="100%" />

<br />

<a href="https://vexoradn.vercel.app"><img src="docs/assets/btn-demo.svg" alt="Abrir o app ↗" height="46" /></a>
<a href="https://github.com/diegonatalo/vexora"><img src="docs/assets/btn-code.svg" alt="Código ↗" height="46" /></a>

<br />

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![dados](https://img.shields.io/badge/dados-s%C3%B3_no_navegador-0b6b4d?style=flat-square)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-16a34a?style=flat-square)

</div>

<br />

<div align="center">

<img src="docs/assets/h-sobre.svg" alt="01 · SOBRE: Sobre o projeto" width="100%" />

</div>

**Cadastre seu perfil uma vez e baixe um CV de 1 página otimizado para ATS.**<br />
O Vexora é um gerador de currículo em PDF. Você cadastra seu perfil uma vez, confere a verificação ATS (os sistemas que leem currículos antes de um recrutador) e baixa um CV de 1 página que esses sistemas conseguem ler.

Tudo roda no navegador: não há backend, login nem IA generativa. Seus dados ficam só no seu navegador (IndexedDB) e podem ser exportados e importados em JSON para backup. A interface é em português do Brasil.

<br />

<div align="center">

<img src="docs/assets/h-demo.svg" alt="02 · DEMO: Demonstração" width="100%" />

</div>

<div align="center">

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/shot-01.svg" /><img src="docs/assets/shot-01-light.svg" alt="Editor do Vexora com navegação de seções, formulário de dados pessoais, espaço da página e pré-visualização do CV em PDF" width="100%" /></picture>
<br />
<sub><b>Editor</b>: seções à esquerda, formulário no centro e pré-visualização do PDF à direita. Os dados do print são fictícios.</sub>

<br />

<img src="docs/assets/shot-02.svg" alt="Seção Experiência com cartão de item, interruptor Exibir no CV, datas e tópicos com contador de caracteres" width="100%" />
<br />
<sub><b>Experiência</b>: "Exibir no CV" oculta o item do PDF sem apagá-lo.</sub>

<br />

<img src="docs/assets/shot-03.svg" alt="Editor no celular, com a navegação de seções em faixa rolável, e pré-visualização do CV com o espaço da página usado" width="100%" />
<br />
<sub><b>No celular</b>: o seletor Editar e Prévia alterna entre o formulário e o PDF.</sub>

</div>

<br />

<div align="center">

<img src="docs/assets/h-func.svg" alt="03 · FUNCIONALIDADES: O que dá para fazer" width="100%" />

</div>

<div align="center">

<img src="docs/assets/f-01.svg" alt="Editor por seções: Um único formulário dividido em seções, com navegação lateral, progresso e validação ao sair do campo. O perfil é salvo a cada edição, mesmo incompleto." width="49%" />
<img src="docs/assets/f-02.svg" alt="CV de 1 página para ATS: PDF de uma coluna, só texto, em Helvetica, sem imagens, ícones nem tabelas, com títulos de seção padrão. O texto sai selecionável, na ordem certa." width="49%" />
<br />
<img src="docs/assets/f-03.svg" alt="Ajuste automático de página: Espaçamento, fonte (de 11 a 10pt) e margens (até 36pt) se ajustam até caber em 1 página. Se ainda não couber, o download é bloqueado e o app sugere o que enxugar." width="49%" />
<img src="docs/assets/f-04.svg" alt="Verificação ATS: Oito checagens feitas sobre o PDF real, lido de volta com pdfjs: contato, títulos, fonte, imagens e contagem de páginas, cada uma com o problema e como corrigir." width="49%" />
<br />
<img src="docs/assets/f-05.svg" alt="Pré-visualização fiel: A prévia desenha os mesmos bytes que serão baixados, em canvas, para funcionar também no iOS e em Androids que não exibem PDF em iframe." width="49%" />
<img src="docs/assets/f-06.svg" alt="Organização livre: Arraste e solte experiências, formações e certificações. &quot;Exibir no CV&quot; oculta qualquer item do PDF sem apagá-lo. Habilidades são grupos com os nomes que você escolher." width="49%" />
<br />
<img src="docs/assets/f-07.svg" alt="Privacidade (LGPD): Sem backend, sem login e sem IA generativa. Seus dados ficam só no IndexedDB deste navegador e nada é enviado a servidor." width="49%" />
<img src="docs/assets/f-08.svg" alt="Backup e tema: Exporte e importe o perfil em JSON, inclusive backups antigos. Tema claro e escuro, interface em português do Brasil e Lighthouse de acessibilidade 100 no editor." width="49%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-stack.svg" alt="04 · STACK: Stack" width="100%" />

</div>

<div align="center">

<img src="docs/assets/stack.svg" alt="Stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Zod · React Hook Form, @react-pdf/renderer · pdfjs-dist, Vitest 5" width="100%" />

</div>

<br />

<div align="center">

<img src="docs/assets/h-run.svg" alt="05 · COMO RODAR: Rodando localmente" width="100%" />

</div>

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
| `pnpm check` | Roda typecheck, lint e testes em sequência |

### 🔑 Variáveis de ambiente

Nenhuma é obrigatória. `NEXT_PUBLIC_SITE_URL` é opcional: define o endereço público usado no sitemap, no robots e nas imagens de compartilhamento.

<br />

<div align="center">

<img src="docs/assets/h-estrutura.svg" alt="06 · ESTRUTURA: Estrutura" width="100%" />

</div>

```text
docs/             decisões de projeto (decisions.md) e fontes deste README
public/           arquivos estáticos
├── app/          rota /editor, layout, metadados, sitemap e robots
├── components/   editor (seções, ATS, backup), preview, ui e pdf (documento do CV, react-pdf)
├── lib/          schema, storage, ajuste de página, checagens ATS e geração do PDF
└── tests/        utilitários de teste de PDF
```

<br />

<div align="center">

<img src="docs/assets/h-mais.svg" alt="07 · MAIS: Mais informações" width="100%" />

</div>

### 🧠 Como funciona

| Conceito | Regra |
|---|---|
| **PDF real** | O PDF é gerado como texto com `@react-pdf/renderer` e lido de volta com `pdfjs-dist`. As checagens e a contagem de páginas usam o arquivo real, não uma estimativa. |
| **Ajuste para 1 página** | Seis níveis, do padrão (11pt) até margens de 36pt, passando por espaçamento menor e fonte de 10,5 e 10pt. Se nem o último couber, o download fica desabilitado. |
| **Exibir no CV** | Cada experiência, formação, certificação, idioma e grupo de habilidades pode ser ocultado do PDF sem apagar. Não há limite de itens. |
| **Rascunho sempre salvo** | O formulário aceita campos vazios. O que estiver preenchido precisa ser válido, e a obrigatoriedade de e-mail e telefone é cobrada pela verificação ATS. |
| **Bloqueio do download** | Só nome vazio e CV acima de 1 página bloqueiam o botão. As demais falhas aparecem como avisos. |

Todas as decisões, com o porquê, estão em [`docs/decisions.md`](docs/decisions.md).

### 🔎 SEO e compartilhamento

- `sitemap.xml` e `robots.txt` vêm de `app/sitemap.ts` e `app/robots.ts`.
- Open Graph e Twitter Card (título, descrição e imagem de 1200x630) são definidos em `app/layout.tsx`. A rota `/editor` tem título próprio.
- O endereço público vem de `lib/site.ts`: `NEXT_PUBLIC_SITE_URL` se definida, `http://localhost:3000` em desenvolvimento e `https://vexoradn.vercel.app` nos demais casos.
- Favicon: `icon.svg`, `favicon.ico` e `apple-icon.png` em `app/`.

### 🌐 Deploy

O site é publicado na Vercel em <https://vexoradn.vercel.app>. Basta importar o repositório e usar as configurações padrão do Next.js. Não há variáveis obrigatórias.

Ao trocar para um domínio próprio, defina `NEXT_PUBLIC_SITE_URL` (por exemplo `https://vexora.app`) para que o sitemap e as imagens de compartilhamento apontem para ele.

### 📄 Créditos e licença

- Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE).

<br />

<div align="center">

<img src="docs/assets/h-autor.svg" alt="08 · AUTOR: Autor" width="100%" />

</div>

<div align="center">

<a href="https://diegonatalo.dev"><img src="docs/assets/btn-portfolio.svg" alt="Portfólio ↗" height="46" /></a>
<a href="https://www.linkedin.com/in/diegonatalo/"><img src="docs/assets/btn-linkedin.svg" alt="LinkedIn ↗" height="46" /></a>
<a href="https://github.com/diegonatalo"><img src="docs/assets/btn-github.svg" alt="GitHub ↗" height="46" /></a>

</div>

<br />

<div align="center">

<img src="docs/assets/footer.svg" alt="© 2026 Diego Natalo. Feito com 💚 para quem quer um currículo que o ATS consegue ler" width="100%" />

</div>
