"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtsCard } from "@/components/editor/AtsCard";
import { EspacoPagina } from "@/components/editor/EspacoPagina";
import { SectionNav } from "@/components/editor/SectionNav";
import {
  DadosPessoaisSecao,
  LinksSecao,
  ResumoSecao,
} from "@/components/editor/secoes/SecoesSimples";
import { ExperienciaSecao } from "@/components/editor/secoes/ExperienciaSecao";
import {
  CertificacoesSecao,
  FormacaoSecao,
  HabilidadesSecao,
} from "@/components/editor/secoes/ListasSecoes";
import { useAnalise } from "@/components/preview/use-analise";
import { AlternarTema } from "@/components/ui/AlternarTema";
import { BOTAO, CARTAO } from "@/components/ui/estilos";
import { Icon } from "@/components/ui/icons";
import { rodarChecagens } from "@/lib/ats/checks";
import { sugerirEnxugar } from "@/lib/ats/enxugar";
import { nomeDoArquivo } from "@/lib/pdf/gerar";
import { prepararPdf } from "@/lib/pdf/preparar";
import { perfilSchema, type Perfil } from "@/lib/schema";
import { somenteVisiveis } from "@/lib/visiveis";
import { SECOES, statusDasSecoes, type SecaoId } from "@/lib/secoes";
import type { Dados } from "@/lib/storage";
import type { EstadoSalvamento } from "@/lib/use-dados";

// pdfjs e react-pdf só no navegador, e fora do bundle inicial.
const PdfPreview = dynamic(() => import("@/components/preview/PdfPreview"), {
  ssr: false,
  loading: () => (
    <p className="text-muted py-10 text-center text-sm" role="status">
      Gerando pré-visualização…
    </p>
  ),
});

const TEXTO_ESTADO: Record<EstadoSalvamento, string> = {
  carregando: "Carregando…",
  salvando: "Salvando…",
  salvo: "Salvo neste navegador",
  erro: "Não foi possível salvar",
};

const SECAO_COMPONENTE: Record<SecaoId, () => React.JSX.Element> = {
  dados: DadosPessoaisSecao,
  resumo: ResumoSecao,
  experiencia: ExperienciaSecao,
  formacao: FormacaoSecao,
  certificacoes: CertificacoesSecao,
  habilidades: HabilidadesSecao,
  links: LinksSecao,
};

type Props = {
  dadosIniciais: Dados;
  estado: EstadoSalvamento;
  onAlterar: (dados: Dados) => void;
  /** Slot do rodapé da coluna 1 (exportar/importar). */
  backup?: React.ReactNode;
};

export function EditorShell({
  dadosIniciais,
  estado,
  onAlterar,
  backup,
}: Props) {
  const form = useForm<Perfil>({
    resolver: zodResolver(perfilSchema),
    defaultValues: dadosIniciais.perfil,
    mode: "onTouched",
  });
  const [ativa, setAtiva] = useState<SecaoId>("dados");
  // Em telas estreitas só um painel aparece por vez (editar ou pré-visualizar).
  const [painel, setPainel] = useState<"editar" | "previa">("editar");
  const primeiraRenderizacao = useRef(true);

  // Todo rascunho é salvo, mesmo com campos inválidos (ver sanitizar.ts).
  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => onAlterar({ perfil: values }),
    });
  }, [form, onAlterar]);

  // Ao trocar de seção, leva o foco ao título (leitores de tela e teclado).
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    document.getElementById("secao-titulo")?.focus();
  }, [ativa]);

  const perfilOriginal = useWatch({ control: form.control }) as Perfil;
  // O que vai para o CV: sem os itens com "Exibir no CV" desligado.
  const perfil = useMemo(
    () => somenteVisiveis(perfilOriginal),
    [perfilOriginal],
  );
  const [baixando, setBaixando] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);

  async function baixarPdf() {
    setBaixando(true);
    setErroPdf(null);
    try {
      // Refaz o ajuste com os dados de agora (a análise pode estar 400ms atrasada).
      const atual = form.getValues();
      const pronto = await prepararPdf(somenteVisiveis(atual));
      if (!pronto.coube) {
        setErroPdf(
          "O CV passa de 1 página. Enxugue o conteúdo para baixar (veja as sugestões em Espaço da página).",
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
    } catch {
      setErroPdf("Não foi possível gerar o PDF. Tente de novo.");
    } finally {
      setBaixando(false);
    }
  }

  const analise = useAnalise(perfil);
  const preparado = analise.preparado;
  const naoCabe = preparado !== null && !preparado.coube;
  const checagens = useMemo(
    () =>
      preparado
        ? rodarChecagens({ perfil, cv: preparado.cv, pdf: preparado.medicao })
        : null,
    [perfil, preparado],
  );
  const sugestoes = useMemo(
    () => (naoCabe ? sugerirEnxugar(perfil) : []),
    [naoCabe, perfil],
  );

  const status = statusDasSecoes(perfilOriginal);
  const indice = SECOES.findIndex((s) => s.id === ativa);
  const anterior = SECOES[indice - 1];
  const proxima = SECOES[indice + 1];
  const SecaoAtiva = SECAO_COMPONENTE[ativa];

  const concluidas = SECOES.filter((x) => status[x.id].concluida).length;
  const semNome = !perfil.nomeCompleto.trim();

  return (
    <FormProvider {...form}>
      <header className="border-line/70 bg-paper/80 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="bg-accent text-on-accent grid size-10 place-items-center rounded-xl shadow-sm">
              <Icon name="logo" size={22} />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">
              Vexora
            </span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
            <p
              role="status"
              className="border-line bg-surface text-muted flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-sm"
            >
              {estado === "salvo" && (
                <Icon name="check" size={16} className="text-accent" />
              )}
              {estado === "erro" && (
                <Icon name="alert" size={16} className="text-warn-icon" />
              )}
              <span className="max-sm:sr-only">{TEXTO_ESTADO[estado]}</span>
            </p>
            <AlternarTema />
            <button
              type="button"
              className={`${BOTAO.primario} min-h-12 px-5`}
              disabled={semNome || baixando || naoCabe}
              title={
                semNome
                  ? "Preencha seu nome para baixar o PDF"
                  : naoCabe
                    ? "O CV passa de 1 página: enxugue o conteúdo para baixar"
                    : undefined
              }
              onClick={baixarPdf}
            >
              <Icon name="download" size={18} />
              {baixando ? "Gerando…" : "Baixar PDF"}
            </button>
          </div>
          {erroPdf && (
            <p
              role="alert"
              className="text-warn-ink bg-warn-bg flex basis-full items-center justify-end gap-1.5 rounded-xl px-3 py-2 text-sm"
            >
              <Icon name="alert" size={16} className="text-warn-icon" />
              {erroPdf}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 pt-6 pb-28 sm:px-6 lg:grid-cols-[256px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)_460px] xl:pb-8">
        <div
          className={`space-y-6 lg:sticky lg:top-24 ${
            painel === "previa" ? "max-xl:hidden" : ""
          }`}
        >
          <SectionNav
            ativa={ativa}
            status={status}
            concluidas={concluidas}
            onSelecionar={setAtiva}
          />
        </div>

        <main
          className={`${CARTAO} p-5 sm:p-8 lg:p-10 ${
            painel === "previa" ? "max-xl:hidden" : ""
          }`}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            aria-label="Editor do perfil"
          >
            <SecaoAtiva />
            <div className="border-line mt-10 flex items-center justify-between gap-3 border-t pt-6">
              {anterior ? (
                <button
                  type="button"
                  className={BOTAO.secundario}
                  onClick={() => setAtiva(anterior.id)}
                >
                  <Icon name="arrow-left" size={18} />
                  {anterior.titulo}
                </button>
              ) : (
                <span />
              )}
              {proxima && (
                <button
                  type="button"
                  className={BOTAO.escuro}
                  onClick={() => setAtiva(proxima.id)}
                >
                  {proxima.titulo}
                  <Icon name="arrow-right" size={18} />
                </button>
              )}
            </div>
          </form>
          <div className="mt-8">{backup}</div>
        </main>

        <aside
          className={`w-full space-y-5 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7.5rem)] xl:overflow-y-auto xl:pr-1 ${
            painel === "editar"
              ? "max-xl:hidden"
              : "max-xl:mx-auto max-xl:max-w-xl lg:col-span-2 xl:col-span-1"
          }`}
        >
          <EspacoPagina
            medicao={preparado?.medicao ?? null}
            ajuste={preparado?.ajuste ?? null}
            coube={preparado?.coube ?? true}
            sugestoes={sugestoes}
          />
          <section aria-labelledby="previa-titulo">
            <h2 id="previa-titulo" className="sr-only">
              Pré-visualização do CV
            </h2>
            <PdfPreview
              bytes={preparado?.bytes ?? null}
              paginas={preparado?.medicao.paginas ?? null}
              gerando={analise.estado === "gerando"}
              erro={analise.estado === "erro"}
            />
          </section>
          <AtsCard checagens={checagens} />
        </aside>
      </div>

      <div
        role="group"
        aria-label="Alternar entre editar e pré-visualizar"
        className="border-line bg-surface shadow-pop fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full border p-1 xl:hidden"
      >
        {(
          [
            ["editar", "Editar", "pencil"],
            ["previa", "Prévia", "eye"],
          ] as const
        ).map(([id, rotulo, icone]) => (
          <button
            key={id}
            type="button"
            aria-pressed={painel === id}
            onClick={() => setPainel(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-medium whitespace-nowrap transition-colors ${
              painel === id
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            <Icon name={icone} size={18} />
            {rotulo}
          </button>
        ))}
      </div>
    </FormProvider>
  );
}
