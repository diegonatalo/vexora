"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
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
import { BOTAO, CARTAO } from "@/components/ui/estilos";
import { Icon } from "@/components/ui/icons";
import { rodarChecagens } from "@/lib/ats/checks";
import { sugerirEnxugar } from "@/lib/ats/enxugar";
import { nomeDoArquivo } from "@/lib/pdf/gerar";
import { prepararPdf } from "@/lib/pdf/preparar";
import { perfilSchema, type Perfil } from "@/lib/schema";
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
  const versoes = useRef(dadosIniciais.versoes);
  const [ativa, setAtiva] = useState<SecaoId>("dados");
  const primeiraRenderizacao = useRef(true);

  // Todo rascunho é salvo, mesmo com campos inválidos (ver sanitizar.ts).
  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) =>
        onAlterar({ perfil: values, versoes: versoes.current }),
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

  const perfil = useWatch({ control: form.control }) as Perfil;
  const [baixando, setBaixando] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);

  async function baixarPdf() {
    setBaixando(true);
    setErroPdf(null);
    try {
      // Refaz o ajuste com os dados de agora (a análise pode estar 400ms atrasada).
      const pronto = await prepararPdf(form.getValues());
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

  const status = statusDasSecoes(perfil);
  const indice = SECOES.findIndex((s) => s.id === ativa);
  const anterior = SECOES[indice - 1];
  const proxima = SECOES[indice + 1];
  const SecaoAtiva = SECAO_COMPONENTE[ativa];

  return (
    <FormProvider {...form}>
      <header className="border-line bg-surface border-b">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="bg-accent rounded-field grid size-9 place-items-center text-white">
              <Icon name="logo" size={20} />
            </span>
            <span className="font-display text-2xl font-bold">Folha</span>
          </div>
          <div className="flex-1 sm:flex-none">
            <label htmlFor="versao" className="sr-only">
              Versão do CV
            </label>
            <select
              id="versao"
              className="border-field bg-surface rounded-field min-h-11 w-full border px-3"
              defaultValue={dadosIniciais.versoes[0]?.id}
            >
              {dadosIniciais.versoes.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome} — {perfil.cargoDesejado || "[Cargo desejado]"}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <p
              role="status"
              className="text-muted flex items-center gap-1.5 text-sm"
            >
              {estado === "salvo" && (
                <Icon name="check" size={16} className="text-accent" />
              )}
              {estado === "erro" && (
                <Icon name="alert" size={16} className="text-warn-icon" />
              )}
              {TEXTO_ESTADO[estado]}
            </p>
            <Link href="/vaga" className={BOTAO.secundario}>
              Adaptar à vaga
            </Link>
            <button
              type="button"
              className={BOTAO.primario}
              disabled={!perfil.nomeCompleto.trim() || baixando || naoCabe}
              title={
                !perfil.nomeCompleto.trim()
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
            {erroPdf && (
              <p
                role="alert"
                className="text-warn-ink flex basis-full items-center justify-end gap-1.5 text-sm"
              >
                <Icon name="alert" size={16} className="text-warn-icon" />
                {erroPdf}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto_1fr] xl:grid-cols-[264px_minmax(0,1fr)_380px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <SectionNav ativa={ativa} status={status} onSelecionar={setAtiva} />
        </div>

        <main
          className={`${CARTAO} p-6 sm:p-8 lg:col-start-2 lg:row-span-4 lg:row-start-1`}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            aria-label="Editor do perfil"
          >
            <SecaoAtiva />
            <div className="mt-8 flex items-center justify-between gap-3">
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
        </main>

        <div className="w-full lg:col-start-1 lg:row-start-2">
          <AtsCard checagens={checagens} />
        </div>

        <div className="w-full lg:col-start-1 lg:row-start-3">{backup}</div>

        <aside className="w-full space-y-6 lg:col-span-2 lg:row-start-5 xl:col-span-1 xl:col-start-3 xl:row-span-4 xl:row-start-1">
          <EspacoPagina
            medicao={preparado?.medicao ?? null}
            ajuste={preparado?.ajuste ?? null}
            coube={preparado?.coube ?? true}
            sugestoes={sugestoes}
          />
          <section className={CARTAO + " p-5"} aria-labelledby="previa-titulo">
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
        </aside>
      </div>
    </FormProvider>
  );
}
