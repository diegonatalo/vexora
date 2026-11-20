import type { IconName } from "@/components/ui/icons";

/** Textos da landing (`/`). As seções ficam em `components/landing/`. */

export const HERO = {
  kicker: "Currículo de 1 página para ATS",
  title: "Seu currículo passa pelo robô e chega no recrutador.",
  subtitle:
    "Muito currículo bom é descartado antes de alguém ler: os sistemas de triagem (ATS) não entendem colunas, ícones e tabelas. O Vexora monta um PDF de uma página que esses sistemas leem do jeito certo.",
  note: "Grátis e sem cadastro. Seus dados ficam só no seu navegador.",
};

export type Step = { title: string; text: string };

export const STEPS: Step[] = [
  {
    title: "Preencha o perfil uma vez",
    text: "Contato, resumo, experiências, formação, cursos e habilidades, seção por seção. Tudo é salvo sozinho enquanto você digita.",
  },
  {
    title: "Veja se ainda cabe",
    text: "Um medidor mostra quanto da página já foi usado, e a prévia do PDF muda na hora. Passou de uma página, ele avisa o que enxugar.",
  },
  {
    title: "Baixe o PDF",
    text: "Com a verificação ATS em dia, é só baixar. O arquivo é gerado no seu navegador, sem passar por servidor nenhum.",
  },
];

export type Feature = { icon: IconName; title: string; text: string };

export const FEATURES: Feature[] = [
  {
    icon: "shield",
    title: "Verificação ATS",
    text: "Confere texto selecionável, coluna única, títulos de seção padrão, fonte compatível, nada de tabelas, ícones ou imagens, e se cabe em 1 página.",
  },
  {
    icon: "eye",
    title: "Prévia ao vivo",
    text: "O PDF aparece ao lado do formulário e acompanha cada mudança. No celular, a prévia fica a um toque.",
  },
  {
    icon: "sparkles",
    title: "Espaço da página",
    text: "O medidor de espaço mostra quanto ainda cabe, para você decidir onde detalhar e onde cortar.",
  },
  {
    icon: "grip",
    title: "Ordem do seu jeito",
    text: "Arraste experiências, formações e cursos para mudar a ordem, e tire um item do CV sem apagá-lo, para adaptar o currículo a cada vaga.",
  },
  {
    icon: "upload",
    title: "Backup em arquivo",
    text: "Exporte o perfil em JSON para guardar ou continuar em outro computador, e importe quando quiser.",
  },
  {
    icon: "moon",
    title: "Claro ou escuro",
    text: "Tema claro e escuro, teclado em tudo e layout que funciona do celular ao monitor grande.",
  },
];

export type Screenshot = { light: string; dark: string; alt: string };

/** Prints gerados por `e2e/screenshots.spec.ts` (nunca à mão). */
export const SCREENSHOT: Screenshot = {
  light: "/landing/editor-claro.webp",
  dark: "/landing/editor-escuro.webp",
  alt: "Editor do Vexora com um perfil preenchido: seções à esquerda, formulário no meio e a prévia do PDF à direita.",
};

export type Faq = { question: string; answer: string };

export const FAQ: Faq[] = [
  {
    question: "É grátis mesmo?",
    answer: "É. Não tem plano pago, cadastro nem limite de downloads.",
  },
  {
    question: "Onde ficam os meus dados?",
    answer:
      "Só no seu navegador (IndexedDB). O PDF também é gerado nele. Nada do que você preenche vai para um servidor.",
  },
  {
    question: "Como levo o currículo para outro computador?",
    answer:
      "Use o backup: exporte o perfil em JSON num computador e importe no outro. Limpar os dados do navegador apaga o perfil, então guarde um backup.",
  },
  {
    question: "O que é ATS?",
    answer:
      "Applicant Tracking System: o sistema que muitas empresas usam para receber e filtrar currículos. Ele lê o texto do PDF; layouts com colunas, tabelas ou imagens costumam sair embaralhados ou vazios.",
  },
];
