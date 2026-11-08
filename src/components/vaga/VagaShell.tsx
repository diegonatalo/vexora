"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BOTAO, CARTAO } from "@/components/ui/estilos";
import { TextAreaField } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { nomeDoArquivo } from "@/lib/pdf/gerar";
import { prepararPdf } from "@/lib/pdf/preparar";
import { novoId, type VersaoCv } from "@/lib/schema";
import type { Dados } from "@/lib/storage";
import {
  aplicarAjustes,
  combinarAjustes,
  sugerirAjustes,
  type Sugestao,
} from "@/lib/vaga/ajustes";
import {
  analisarVaga,
  type AnaliseVaga,
  type PalavraChave,
} from "@/lib/vaga/analisar";

const EXEMPLO = `[Título da vaga] — [Empresa]

Requisitos:
- React, TypeScript e Next.js
- Tailwind CSS
- Git e consumo de APIs REST
- Testes automatizados
- Docker
- Metodologias ágeis`;

type Resultado = {
  analise: AnaliseVaga;
  sugestoes: Sugestao[];
  marcadas: Set<Sugestao["id"]>;
};

type Props = {
  dados: Dados;
  /** Persiste a lista de versões (o perfil original segue intacto). */
  onSalvarVersoes: (versoes: VersaoCv[]) => void;
};

function Chips({
  itens,
  tipo,
}: {
  itens: PalavraChave[];
  tipo: "encontrada" | "ausente";
}) {
  const estilo =
    tipo === "encontrada"
      ? "bg-accent-soft text-accent-deep"
      : "bg-warn-bg text-warn-ink";
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {itens.map((p) => (
        <li
          key={p.termo}
          className={`${estilo} inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium`}
        >
          <Icon name={tipo === "encontrada" ? "check" : "plus"} size={14} />
          {p.termo}
        </li>
      ))}
    </ul>
  );
}

function ItemSugestao({
  sugestao,
  marcada,
  onAlternar,
}: {
  sugestao: Sugestao;
  marcada: boolean;
  onAlternar: () => void;
}) {
  const id = useId();
  return (
    <li className="flex min-h-11 items-start gap-3 py-1.5">
      <input
        id={id}
        type="checkbox"
        checked={marcada}
        onChange={onAlternar}
        className="accent-accent mt-0.5 size-5 shrink-0"
      />
      <label htmlFor={id}>
        {sugestao.partes.map((p, i) =>
          p.negrito ? <strong key={i}>{p.texto}</strong> : p.texto,
        )}
      </label>
    </li>
  );
}

export function VagaShell({ dados, onSalvarVersoes }: Props) {
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [gerando, setGerando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  function analisar() {
    setAviso(null);
    if (!descricao.trim()) {
      setErro("Cole a descrição da vaga para analisar.");
      setResultado(null);
      return;
    }
    setErro(null);
    const analise = analisarVaga(descricao, dados.perfil);
    const sugestoes = sugerirAjustes(dados.perfil, analise);
    setResultado({
      analise,
      sugestoes,
      marcadas: new Set(sugestoes.filter((s) => s.padrao).map((s) => s.id)),
    });
  }

  function alternar(id: Sugestao["id"]) {
    setResultado((r) => {
      if (!r) return r;
      const marcadas = new Set(r.marcadas);
      if (!marcadas.delete(id)) marcadas.add(id);
      return { ...r, marcadas };
    });
  }

  function ajustesEscolhidos() {
    if (!resultado) return null;
    return combinarAjustes(
      resultado.sugestoes.filter((s) => resultado.marcadas.has(s.id)),
    );
  }

  async function gerar() {
    const ajustes = ajustesEscolhidos();
    if (!ajustes) return;
    setGerando(true);
    setErro(null);
    setAviso(null);
    try {
      const perfil = aplicarAjustes(dados.perfil, ajustes);
      if (!perfil.nomeCompleto.trim()) {
        setErro("Preencha seu nome no editor para gerar o PDF.");
        return;
      }
      const pronto = await prepararPdf(perfil);
      if (!pronto.coube) {
        setErro(
          "Mesmo com os ajustes, o CV passa de 1 página. Marque “Ocultar certificações” ou enxugue o conteúdo no editor.",
        );
        return;
      }
      const blob = new Blob([pronto.bytes.slice()], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nomeDoArquivo(perfil.nomeCompleto);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setAviso("CV gerado em 1 página e baixado.");
    } catch {
      setErro("Não foi possível gerar o PDF. Tente de novo.");
    } finally {
      setGerando(false);
    }
  }

  function salvarVersao() {
    const ajustes = ajustesEscolhidos();
    if (!ajustes || !resultado) return;
    const { titulo, empresa } = resultado.analise;
    const nome = [titulo || "Vaga", empresa].filter(Boolean).join(" — ");
    const versao: VersaoCv = {
      id: novoId(),
      nome: nome.slice(0, 80),
      perfilId: dados.perfil.id,
      vaga: { titulo, empresa, descricao },
      ajustes,
    };
    onSalvarVersoes([...dados.versoes, versao]);
    setErro(null);
    setAviso(
      "Versão salva. Escolha-a no seletor de versões do editor para ver e baixar.",
    );
  }

  const analise = resultado?.analise;

  return (
    <>
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="bg-accent rounded-field grid size-9 place-items-center text-white">
              <Icon name="logo" size={20} />
            </span>
            <span className="font-display text-2xl font-bold">Folha</span>
          </div>
          <Link
            href="/editor"
            className="text-accent inline-flex min-h-11 items-center gap-1.5 underline"
          >
            <Icon name="arrow-left" size={16} />
            Voltar ao editor
          </Link>
          <p className="text-muted ml-auto flex items-center gap-1.5 text-sm">
            <Icon name="check-circle" size={16} className="text-accent" />
            Seu perfil original não é alterado
          </p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1200px] items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
        <section className={`${CARTAO} p-6 sm:p-8`} aria-labelledby="vaga-h1">
          <h1 id="vaga-h1" className="font-display text-3xl font-bold">
            Adaptar à vaga
          </h1>
          <p className="text-muted mt-2">
            Cole a descrição. A Folha compara as palavras-chave com o seu perfil
            e reorganiza o CV, sem passar de 1 página.
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              analisar();
            }}
            noValidate
          >
            <TextAreaField
              label="Descrição da vaga"
              rows={12}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder={EXEMPLO}
              error={erro && !resultado ? erro : undefined}
              hint="A análise acontece no seu navegador."
            />
            <button type="submit" className={BOTAO.escuro}>
              Analisar vaga
            </button>
          </form>
        </section>

        <div className="space-y-6" aria-live="polite">
          {!analise ? (
            <section className={`${CARTAO} p-6`}>
              <h2 className="font-display text-xl font-bold">
                Palavras-chave da vaga
              </h2>
              <p className="text-muted mt-2">
                Cole a descrição e clique em “Analisar vaga” para ver o que o
                seu perfil já cobre e o que falta.
              </p>
            </section>
          ) : (
            <>
              <section
                className={`${CARTAO} p-6`}
                aria-labelledby="palavras-h2"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    id="palavras-h2"
                    className="font-display text-xl font-bold"
                  >
                    Palavras-chave da vaga
                  </h2>
                  <p className="text-accent font-medium">
                    {analise.encontradas.length} de{" "}
                    {analise.palavrasChave.length} no seu perfil
                  </p>
                </div>

                {analise.palavrasChave.length === 0 ? (
                  <p className="text-muted mt-3">
                    Não encontramos palavras-chave conhecidas nesse texto. Cole
                    a descrição completa, com os requisitos.
                  </p>
                ) : (
                  <>
                    {analise.encontradas.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium">No seu CV</h3>
                        <Chips itens={analise.encontradas} tipo="encontrada" />
                      </div>
                    )}
                    {analise.naoEncontradas.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium">Não encontradas</h3>
                        <Chips itens={analise.naoEncontradas} tipo="ausente" />
                        <p className="text-warn-ink bg-warn-bg rounded-field mt-4 flex items-start gap-2 p-3 text-sm">
                          <Icon
                            name="alert"
                            size={16}
                            className="text-warn-icon mt-0.5 shrink-0"
                          />
                          Adicione só o que você realmente conhece. O ATS
                          compara palavras, mas a entrevista compara pessoas.
                        </p>
                        <p className="mt-3 text-sm">
                          <Link
                            href="/editor?secao=habilidades"
                            className="text-accent inline-flex min-h-11 items-center underline"
                          >
                            Conheço alguma delas: abrir Habilidades no editor
                          </Link>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className={`${CARTAO} p-6`} aria-labelledby="ajustes-h2">
                <h2 id="ajustes-h2" className="font-display text-xl font-bold">
                  Ajustes sugeridos
                </h2>
                {resultado.sugestoes.length === 0 ? (
                  <p className="text-muted mt-3">
                    Nenhum ajuste a sugerir: o CV já está na melhor ordem para
                    esta vaga.
                  </p>
                ) : (
                  <ul className="mt-2">
                    {resultado.sugestoes.map((s) => (
                      <ItemSugestao
                        key={s.id}
                        sugestao={s}
                        marcada={resultado.marcadas.has(s.id)}
                        onAlternar={() => alternar(s.id)}
                      />
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className={BOTAO.primario}
                    onClick={gerar}
                    disabled={gerando}
                  >
                    <Icon name="download" size={18} />
                    {gerando ? "Gerando…" : "Gerar CV para esta vaga"}
                  </button>
                  <button
                    type="button"
                    className={BOTAO.secundario}
                    onClick={salvarVersao}
                  >
                    Salvar como nova versão
                  </button>
                </div>
              </section>
            </>
          )}

          {erro && resultado && (
            <p
              role="alert"
              className="text-warn-ink flex items-start gap-1.5 text-sm"
            >
              <Icon
                name="alert"
                size={16}
                className="text-warn-icon mt-0.5 shrink-0"
              />
              {erro}
            </p>
          )}
          {aviso && (
            <p
              role="status"
              className="text-accent-deep flex items-center gap-1.5 text-sm"
            >
              <Icon name="check-circle" size={16} />
              {aviso}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
