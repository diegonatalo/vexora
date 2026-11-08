import { ajustesSchema, type Habilidades, type Perfil } from "@/lib/schema";
import { textoTemPalavra, type AnaliseVaga } from "@/lib/vaga/analisar";

export type Ajustes = ReturnType<typeof ajustesSchema.parse>;

export type Parte = { texto: string; negrito?: boolean };

export type Sugestao = {
  id: "habilidades" | "topicos" | "certificacoes" | "resumo";
  /** Frase da tela, com os termos em negrito. */
  partes: Parte[];
  /** Vem marcada? O resumo reescrito fica desmarcado por padrão. */
  padrao: boolean;
  /** O que esta sugestão muda, no formato salvo na versão. */
  ajustes: Partial<Ajustes>;
};

const CATEGORIAS = ["linguagens", "frameworks", "ferramentas"] as const;

export function ajustesVazios(): Ajustes {
  return ajustesSchema.parse({});
}

/** "A", "A e B", "A, B e C" */
export function listarComE(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function listaParaPartes(itens: string[]): Parte[] {
  const partes: Parte[] = [];
  itens.forEach((item, i) => {
    if (i > 0) {
      partes.push({ texto: i === itens.length - 1 ? " e " : ", " });
    }
    partes.push({ texto: item, negrito: true });
  });
  return partes;
}

function sugerirHabilidades(
  perfil: Perfil,
  analise: AnaliseVaga,
): Sugestao | null {
  const ordem: Partial<Habilidades> = {};
  const movidas: string[] = [];

  for (const cat of CATEGORIAS) {
    const itens = perfil.habilidades[cat];
    const citadas = itens.filter((it) =>
      analise.encontradas.some((k) => textoTemPalavra(it, k)),
    );
    const novas = [...citadas, ...itens.filter((it) => !citadas.includes(it))];
    if (novas.some((it, i) => it !== itens[i])) {
      ordem[cat] = novas;
      movidas.push(
        ...citadas.filter((it) => itens.indexOf(it) >= citadas.length),
      );
    }
  }
  if (Object.keys(ordem).length === 0) return null;

  const mostradas = movidas.slice(0, 3);
  return {
    id: "habilidades",
    partes: [
      { texto: "Mover " },
      ...listaParaPartes(mostradas),
      { texto: " para o início de Habilidades técnicas" },
    ],
    padrao: true,
    ajustes: { ordemHabilidades: ordem },
  };
}

function sugerirTopicos(perfil: Perfil, analise: AnaliseVaga): Sugestao | null {
  const destaques: Ajustes["topicosEmDestaque"] = [];
  let melhor = { posicao: 0, achados: 0, palavra: "" };

  perfil.experiencias.forEach((exp, posicao) => {
    const indices: number[] = [];
    const contagem = new Map<string, number>();
    exp.topicos.forEach((topico, i) => {
      const citadas = analise.encontradas.filter((k) =>
        textoTemPalavra(topico, k),
      );
      if (citadas.length === 0) return;
      indices.push(i);
      citadas.forEach((k) =>
        contagem.set(k.termo, (contagem.get(k.termo) ?? 0) + 1),
      );
    });
    const jaNoInicio = indices.every((valor, i) => valor === i);
    if (indices.length === 0 || jaNoInicio) return;
    destaques.push({ experienciaId: exp.id, indices });
    if (indices.length > melhor.achados) {
      const [palavra = ""] = [...contagem.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0] ?? [""];
      melhor = { posicao, achados: indices.length, palavra };
    }
  });
  if (destaques.length === 0) return null;

  const partes: Parte[] =
    destaques.length === 1
      ? [
          {
            texto: `Priorizar os tópicos da Experiência ${melhor.posicao + 1} que citam `,
          },
          { texto: melhor.palavra, negrito: true },
        ]
      : [{ texto: "Priorizar os tópicos das experiências que citam a vaga" }];
  return {
    id: "topicos",
    partes,
    padrao: true,
    ajustes: { topicosEmDestaque: destaques },
  };
}

function sugerirCertificacoes(
  perfil: Perfil,
  analise: AnaliseVaga,
): Sugestao | null {
  const ocultas = perfil.certificacoes
    .filter(
      (c) =>
        !analise.palavrasChave.some((k) =>
          textoTemPalavra(`${c.nome} ${c.instituicao}`, k),
        ),
    )
    .map((c) => c.id);
  if (ocultas.length === 0) return null;
  return {
    id: "certificacoes",
    partes: [
      {
        texto:
          "Ocultar certificações sem relação com a vaga para manter 1 página",
      },
    ],
    padrao: true,
    ajustes: { certificacoesOcultas: ocultas },
  };
}

const LIMITE_RESUMO = 500;

/**
 * Resumo com o título da vaga. Usa só o que já está no perfil (cargo desejado,
 * palavras que o perfil de fato cita); nada é inventado.
 */
export function montarResumoAlternativo(
  perfil: Perfil,
  analise: AnaliseVaga,
): string | null {
  if (!analise.titulo || analise.encontradas.length === 0) return null;
  const termos = listarComE(
    analise.encontradas.slice(0, 4).map((k) => k.termo),
  );
  const quem = perfil.cargoDesejado.trim() || "Profissional";
  const frase = `${quem} com experiência em ${termos}, interessado(a) na vaga de ${analise.titulo}.`;
  const completo = perfil.resumo.trim()
    ? `${frase} ${perfil.resumo.trim()}`
    : frase;
  return (completo.length <= LIMITE_RESUMO ? completo : frase).slice(
    0,
    LIMITE_RESUMO,
  );
}

function sugerirResumo(perfil: Perfil, analise: AnaliseVaga): Sugestao | null {
  const resumo = montarResumoAlternativo(perfil, analise);
  if (!resumo) return null;
  return {
    id: "resumo",
    partes: [
      { texto: "Reescrever o resumo usando o título da vaga: " },
      { texto: analise.titulo, negrito: true },
    ],
    padrao: false,
    ajustes: { resumoAlternativo: resumo },
  };
}

export function sugerirAjustes(
  perfil: Perfil,
  analise: AnaliseVaga,
): Sugestao[] {
  return [
    sugerirHabilidades(perfil, analise),
    sugerirTopicos(perfil, analise),
    sugerirCertificacoes(perfil, analise),
    sugerirResumo(perfil, analise),
  ].filter((s): s is Sugestao => s !== null);
}

/** Junta os ajustes das sugestões marcadas no formato salvo na versão. */
export function combinarAjustes(sugestoes: Sugestao[]): Ajustes {
  const ajustes = ajustesVazios();
  for (const s of sugestoes) {
    const a = s.ajustes;
    if (a.ordemHabilidades) ajustes.ordemHabilidades = a.ordemHabilidades;
    if (a.topicosEmDestaque) ajustes.topicosEmDestaque = a.topicosEmDestaque;
    if (a.certificacoesOcultas)
      ajustes.certificacoesOcultas = a.certificacoesOcultas;
    if (a.resumoAlternativo) ajustes.resumoAlternativo = a.resumoAlternativo;
  }
  return ajustes;
}

function reordenar<T>(itens: T[], prioritarios: number[]): T[] {
  const validos = prioritarios.filter((i) => i >= 0 && i < itens.length);
  const unicos = [...new Set(validos)];
  return [
    ...unicos.map((i) => itens[i]),
    ...itens.filter((_, i) => !unicos.includes(i)),
  ];
}

/**
 * Devolve uma CÓPIA do perfil com os ajustes aplicados. O perfil original
 * nunca é alterado. Só reordena e oculta; nada é acrescentado, exceto o
 * resumo alternativo que a própria pessoa escolheu usar.
 */
export function aplicarAjustes(perfil: Perfil, ajustes: Ajustes): Perfil {
  const habilidades = { ...perfil.habilidades };
  for (const cat of CATEGORIAS) {
    const ordem = ajustes.ordemHabilidades[cat];
    if (!ordem) continue;
    // Tolera perfil editado depois: só reordena o que ainda existe.
    const existentes = ordem.filter((it) => habilidades[cat].includes(it));
    habilidades[cat] = [
      ...existentes,
      ...habilidades[cat].filter((it) => !existentes.includes(it)),
    ];
  }

  const experiencias = perfil.experiencias.map((exp) => {
    const destaque = ajustes.topicosEmDestaque.find(
      (d) => d.experienciaId === exp.id,
    );
    return destaque
      ? { ...exp, topicos: reordenar(exp.topicos, destaque.indices) }
      : exp;
  });

  return {
    ...perfil,
    resumo: ajustes.resumoAlternativo?.trim() || perfil.resumo,
    experiencias,
    habilidades,
    certificacoes: perfil.certificacoes.filter(
      (c) => !ajustes.certificacoesOcultas.includes(c.id),
    ),
  };
}
