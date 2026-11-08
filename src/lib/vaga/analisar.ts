import type { Perfil } from "@/lib/schema";
import {
  GLOSSARIO,
  type Categoria,
  type TermoCompilado,
} from "@/lib/vaga/glossario";
import { contemSequencia, tokenizar } from "@/lib/vaga/normalizar";
import { PALAVRAS_DE_ANUNCIO, STOPWORDS } from "@/lib/vaga/stopwords";

export type PalavraChave = {
  /** Texto exibido (grafia do glossário ou da própria vaga). */
  termo: string;
  /** Formas aceitas para procurar no perfil. */
  formas: string[][];
  categoria: Categoria | "recorrente";
};

export type AnaliseVaga = {
  titulo: string;
  empresa: string;
  palavrasChave: PalavraChave[];
  encontradas: PalavraChave[];
  naoEncontradas: PalavraChave[];
};

const MIN_REPETICOES = 2;
const MIN_LETRAS = 3;

/**
 * Acha termos do glossário no texto. Casa primeiro as formas mais longas e
 * marca as palavras usadas, para "Tailwind CSS" não contar também "CSS".
 */
function acharNoGlossario(
  tokens: string[],
  glossario: TermoCompilado[],
  usados: boolean[],
): PalavraChave[] {
  const candidatos = glossario.flatMap((g) =>
    g.formas.map((forma) => ({ g, forma })),
  );
  candidatos.sort((a, b) => b.forma.length - a.forma.length);

  const achados = new Map<string, { chave: PalavraChave; posicao: number }>();
  for (const { g, forma } of candidatos) {
    for (let i = 0; i + forma.length <= tokens.length; i++) {
      const casa = forma.every((t, k) => tokens[i + k] === t && !usados[i + k]);
      if (!casa) continue;
      for (let k = 0; k < forma.length; k++) usados[i + k] = true;
      const atual = achados.get(g.termo);
      if (!atual || i < atual.posicao) {
        achados.set(g.termo, {
          chave: { termo: g.termo, formas: g.formas, categoria: g.categoria },
          posicao: i,
        });
      }
    }
  }
  return [...achados.values()]
    .sort((a, b) => a.posicao - b.posicao)
    .map((a) => a.chave);
}

/** Termos que não estão no glossário mas se repetem na descrição. */
function acharRecorrentes(tokens: string[], usados: boolean[]): PalavraChave[] {
  const contagem = new Map<string, { n: number; posicao: number }>();
  tokens.forEach((t, i) => {
    if (usados[i]) return;
    if (t.length < MIN_LETRAS || /^\d+$/.test(t)) return;
    if (STOPWORDS.has(t) || PALAVRAS_DE_ANUNCIO.has(t)) return;
    const c = contagem.get(t);
    if (c) c.n += 1;
    else contagem.set(t, { n: 1, posicao: i });
  });
  return [...contagem.entries()]
    .filter(([, c]) => c.n >= MIN_REPETICOES)
    .sort((a, b) => a[1].posicao - b[1].posicao)
    .map(([t]) => ({ termo: t, formas: [[t]], categoria: "recorrente" }));
}

/** "Dev Front-end — Acme" → título e empresa (1ª linha da descrição). */
export function lerTituloEEmpresa(descricao: string): {
  titulo: string;
  empresa: string;
} {
  const linha =
    descricao
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find(Boolean) ?? "";
  const [titulo = "", empresa = ""] = linha
    .split(/\s+[—–|@]\s+|\s+-\s+/)
    .map((p) => p.trim());
  return { titulo: titulo.slice(0, 80), empresa: empresa.slice(0, 80) };
}

/** Todo o texto do perfil (menos ids), para procurar as palavras-chave. */
function textosDoPerfil(valor: unknown, chave = ""): string[] {
  if (chave === "id" || chave === "perfilId") return [];
  if (typeof valor === "string") return [valor];
  if (Array.isArray(valor)) return valor.flatMap((v) => textosDoPerfil(v));
  if (valor && typeof valor === "object") {
    return Object.entries(valor).flatMap(([k, v]) => textosDoPerfil(v, k));
  }
  return [];
}

export function textoTemPalavra(texto: string, chave: PalavraChave): boolean {
  const tokens = tokenizar(texto);
  return chave.formas.some((f) => contemSequencia(tokens, f));
}

export function analisarVaga(
  descricao: string,
  perfil: Perfil,
  glossario: TermoCompilado[] = GLOSSARIO,
): AnaliseVaga {
  const tokens = tokenizar(descricao);
  const usados = tokens.map(() => false);
  const doGlossario = acharNoGlossario(tokens, glossario, usados);
  const recorrentes = acharRecorrentes(tokens, usados);
  const palavrasChave = [...doGlossario, ...recorrentes];

  const tokensPerfil = tokenizar(textosDoPerfil(perfil).join(" \n "));
  const tem = (p: PalavraChave) =>
    p.formas.some((f) => contemSequencia(tokensPerfil, f));

  return {
    ...lerTituloEEmpresa(descricao),
    palavrasChave,
    encontradas: palavrasChave.filter(tem),
    naoEncontradas: palavrasChave.filter((p) => !tem(p)),
  };
}
