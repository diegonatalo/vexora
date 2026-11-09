import type { CvModel } from "@/lib/pdf/cv-model";
import type { Medicao } from "@/lib/pdf/medicao";

/** Parâmetros de layout do PDF, em pontos (pt). */
export type Ajuste = {
  nivel: number;
  fonte: number;
  lineHeight: number;
  /** Espaço acima de cada seção. */
  espacoSecao: number;
  /** Espaço abaixo de cada experiência. */
  espacoItem: number;
  margemV: number;
  margemH: number;
  descricao: string;
};

/**
 * Do mais folgado ao mais compacto, na ordem do prompt: primeiro espaçamentos,
 * depois a fonte do corpo (de 11pt até 10pt) e por fim as margens (mínimo 36).
 * Cada nível cabe tanto quanto o anterior ou mais.
 */
export const NIVEIS: readonly Ajuste[] = [
  {
    nivel: 0,
    fonte: 11,
    lineHeight: 1.35,
    espacoSecao: 14,
    espacoItem: 6,
    margemV: 48,
    margemH: 56,
    descricao: "Layout padrão",
  },
  {
    nivel: 1,
    fonte: 11,
    lineHeight: 1.3,
    espacoSecao: 10,
    espacoItem: 4,
    margemV: 48,
    margemH: 56,
    descricao: "espaçamentos reduzidos",
  },
  {
    nivel: 2,
    fonte: 10.5,
    lineHeight: 1.3,
    espacoSecao: 10,
    espacoItem: 4,
    margemV: 48,
    margemH: 56,
    descricao: "fonte do corpo em 10,5pt",
  },
  {
    nivel: 3,
    fonte: 10,
    lineHeight: 1.3,
    espacoSecao: 10,
    espacoItem: 4,
    margemV: 48,
    margemH: 56,
    descricao: "fonte do corpo em 10pt",
  },
  {
    nivel: 4,
    fonte: 10,
    lineHeight: 1.3,
    espacoSecao: 10,
    espacoItem: 4,
    margemV: 42,
    margemH: 46,
    descricao: "fonte em 10pt e margens reduzidas",
  },
  {
    nivel: 5,
    fonte: 10,
    lineHeight: 1.3,
    espacoSecao: 10,
    espacoItem: 4,
    margemV: 36,
    margemH: 36,
    descricao: "fonte em 10pt e margens mínimas (36pt)",
  },
];

export type Renderizador = {
  renderizar: (cv: CvModel, ajuste: Ajuste) => Promise<Uint8Array>;
  medir: (bytes: Uint8Array, ajuste: Ajuste) => Promise<Medicao>;
};

export type ResultadoFit = {
  ajuste: Ajuste;
  bytes: Uint8Array;
  medicao: Medicao;
  /** false = nem o nível mais compacto coube: o PDF tem mais de 1 página. */
  coube: boolean;
};

/**
 * Escolhe o ajuste menos agressivo que faz o CV caber em 1 página.
 *
 * Mede o PDF de verdade (em vez de estimar a altura do texto), então o
 * resultado é exato. Como cada nível cabe tanto quanto o anterior, usa busca
 * binária: no máximo 5 renderizações. Nunca corta conteúdo: se nada couber,
 * devolve `coube: false` com o nível mais compacto, para a interface avisar.
 */
export async function ajustarParaUmaPagina(
  cv: CvModel,
  { renderizar, medir }: Renderizador,
): Promise<ResultadoFit> {
  const cache = new Map<number, Omit<ResultadoFit, "coube">>();

  const tentar = async (nivel: number) => {
    const guardado = cache.get(nivel);
    if (guardado) return guardado;
    const ajuste = NIVEIS[nivel];
    const bytes = await renderizar(cv, ajuste);
    const resultado = { ajuste, bytes, medicao: await medir(bytes, ajuste) };
    cache.set(nivel, resultado);
    return resultado;
  };
  const cabe = (r: { medicao: Medicao }) => r.medicao.paginas <= 1;

  const primeiro = await tentar(0);
  if (cabe(primeiro)) return { ...primeiro, coube: true };

  const ultimoNivel = NIVEIS.length - 1;
  const maisCompacto = await tentar(ultimoNivel);
  if (!cabe(maisCompacto)) return { ...maisCompacto, coube: false };

  let baixo = 1;
  let alto = ultimoNivel; // já sabemos que este cabe
  while (baixo < alto) {
    const meio = (baixo + alto) >> 1;
    if (cabe(await tentar(meio))) alto = meio;
    else baixo = meio + 1;
  }
  return { ...(await tentar(alto)), coube: true };
}
