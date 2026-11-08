"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { BOTAO, CARTAO } from "@/components/ui/estilos";
import { Icon } from "@/components/ui/icons";
import { perfilSchema, type Perfil } from "@/lib/schema";
import { SECOES, statusDasSecoes, type SecaoId } from "@/lib/secoes";
import type { Dados } from "@/lib/storage";
import type { EstadoSalvamento } from "@/lib/use-dados";

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
              disabled
              title="Disponível na Fase 3"
            >
              <Icon name="download" size={18} />
              Baixar PDF
            </button>
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

        <section className={`${CARTAO} p-5 lg:col-start-1 lg:row-start-2`}>
          <h2 className="font-display text-lg font-semibold">
            Verificação ATS
          </h2>
          <p className="text-muted mt-1 text-sm">
            As checagens chegam na Fase 4.
          </p>
        </section>

        <div className="w-full lg:col-start-1 lg:row-start-3">{backup}</div>

        <aside className="w-full space-y-6 lg:col-span-2 lg:row-start-5 xl:col-span-1 xl:col-start-3 xl:row-span-4 xl:row-start-1">
          <section className={CARTAO + " p-5"}>
            <h2 className="font-display text-lg font-semibold">
              Espaço da página
            </h2>
            <p className="text-muted mt-1 text-sm">
              O cálculo de espaço chega na Fase 4.
            </p>
          </section>
          <section className={CARTAO + " p-5"}>
            <h2 className="font-display text-lg font-semibold">
              Pré-visualização
            </h2>
            <p className="text-muted mt-1 text-sm">
              A pré-visualização do PDF chega na Fase 3.
            </p>
          </section>
        </aside>
      </div>
    </FormProvider>
  );
}
