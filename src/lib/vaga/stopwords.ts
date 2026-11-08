import { normalizar } from "@/lib/vaga/normalizar";

const PT = `a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sob sobre
entre ate apos ante e ou mas nem que se como quando onde quem qual quais cujo cuja ao aos
a as ser estar ter haver fazer ir vir poder dever ha sao era foi sera esta estao tem tinha
tera seu sua seus suas meu minha nosso nossa voce voces nos eles elas ele ela isso isto aquilo
esse essa esses essas este esta estes estas aquele aquela mais menos muito muita muitos muitas
pouco pouca tambem ja ainda so apenas todo toda todos todas cada outro outra outros outras
mesmo mesma bem mal ao pelo pela pelos pelas num numa dum duma ser sera serao ate`;

const EN = `a an the and or but nor of to in on at by for with without about as into from up down over
under between is are was were be been being am do does did have has had having will would can
could should may might must shall it its this that these those you your yours we our ours they
their them he she him her his hers i me my mine who whom whose which what when where why how
all any both each few more most other some such no not only own same so than too very just also
if then else per via etc`;

/**
 * Palavras comuns em anúncios de vaga que não dizem nada sobre a pessoa
 * (para a busca de termos recorrentes não ficar cheia de ruído).
 */
const ANUNCIO = `vaga vagas empresa empresas equipe equipes time times trabalho trabalhar experiencia
experiencias conhecimento conhecimentos requisito requisitos desejavel desejaveis diferencial
diferenciais obrigatorio obrigatorios responsabilidade responsabilidades atividades atividade
buscamos procuramos oferecemos beneficios beneficio salario remuneracao contratacao candidato
candidata candidatos profissional profissionais area areas projeto projetos desenvolvimento
nivel anos ano mes meses atuar atuacao ambiente oportunidade processo seletivo job jobs
requirements responsibilities experience knowledge team teams company work working skills
years year strong ability nice plus preferred required role position benefits salary`;

const conjunto = (lista: string) =>
  new Set(lista.split(/\s+/).map(normalizar).filter(Boolean));

export const STOPWORDS = conjunto(`${PT} ${EN}`);
export const PALAVRAS_DE_ANUNCIO = conjunto(ANUNCIO);
