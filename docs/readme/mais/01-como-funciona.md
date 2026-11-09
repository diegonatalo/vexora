### 🧠 Como funciona

| Conceito | Regra |
|---|---|
| **PDF real** | O PDF é gerado como texto com `@react-pdf/renderer` e lido de volta com `pdfjs-dist`. As checagens e a contagem de páginas usam o arquivo real, não uma estimativa. |
| **Ajuste para 1 página** | Seis níveis, do padrão (11pt) até margens de 36pt, passando por espaçamento menor e fonte de 10,5 e 10pt. Se nem o último couber, o download fica desabilitado. |
| **Exibir no CV** | Cada experiência, formação, certificação, idioma e grupo de habilidades pode ser ocultado do PDF sem apagar. Não há limite de itens. |
| **Rascunho sempre salvo** | O formulário aceita campos vazios. O que estiver preenchido precisa ser válido, e a obrigatoriedade de e-mail e telefone é cobrada pela verificação ATS. |
| **Bloqueio do download** | Só nome vazio e CV acima de 1 página bloqueiam o botão. As demais falhas aparecem como avisos. |

Todas as decisões, com o porquê, estão em [`docs/decisions.md`](docs/decisions.md).
