"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtsCard } from "@/components/editor/ats-card";
import { PageSpace } from "@/components/editor/page-space";
import { SectionNav } from "@/components/editor/section-nav";
import {
  PersonalDataSection,
  LinksSection,
  SummarySection,
} from "@/components/editor/sections/simple-sections";
import { ExperienceSection } from "@/components/editor/sections/experience-section";
import {
  CertificationsSection,
  EducationSection,
  SkillsSection,
} from "@/components/editor/sections/list-sections";
import { useAnalysis } from "@/hooks/use-analysis";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BUTTON, CARD } from "@/components/ui/styles";
import { Icon } from "@/components/ui/icons";
import { runChecks } from "@/lib/ats/checks";
import { suggestTrim } from "@/lib/ats/trim";
import { fileName } from "@/lib/pdf/generate";
import { preparePdf } from "@/lib/pdf/prepare";
import { profileSchema, type Profile } from "@/lib/schema";
import { onlyVisible } from "@/lib/visibility";
import { SECTIONS, sectionStatuses, type SectionId } from "@/lib/sections";
import type { AppData } from "@/lib/storage";
import type { SaveState } from "@/hooks/use-data";

// pdfjs e react-pdf só no navegador, e fora do bundle inicial.
const PdfPreview = dynamic(() => import("@/components/preview/pdf-preview").then((m) => m.PdfPreview), {
  ssr: false,
  loading: () => (
    <p className="text-muted py-10 text-center text-sm" role="status">
      Gerando pré-visualização…
    </p>
  ),
});

const STATE_TEXT: Record<SaveState, string> = {
  loading: "Carregando…",
  saving: "Salvando…",
  saved: "Salvo neste navegador",
  error: "Não foi possível salvar",
};

const SECTION_COMPONENT: Record<SectionId, () => React.JSX.Element> = {
  personal: PersonalDataSection,
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  certifications: CertificationsSection,
  skills: SkillsSection,
  links: LinksSection,
};

type Props = {
  initialData: AppData;
  state: SaveState;
  onChange: (data: AppData) => void;
  /** Slot do rodapé da coluna 1 (exportar/importar). */
  backup?: React.ReactNode;
};

export const EditorShell = ({
  initialData,
  state,
  onChange,
  backup,
}: Props) => {
  const form = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData.profile,
    mode: "onTouched",
  });
  const [active, setActive] = useState<SectionId>("personal");
  // Em telas estreitas só um painel aparece por vez (editar ou pré-visualizar).
  const [panel, setPanel] = useState<"editar" | "previa">("editar");
  const firstRender = useRef(true);

  // Todo rascunho é salvo, mesmo com campos inválidos (ver sanitizar.ts).
  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => onChange({ profile: values }),
    });
  }, [form, onChange]);

  // Ao trocar de seção, leva o foco ao título (leitores de tela e teclado).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.getElementById("secao-titulo")?.focus();
  }, [active]);

  const originalProfile = useWatch({ control: form.control }) as Profile;
  // O que vai para o CV: sem os itens com "Exibir no CV" desligado.
  const profile = useMemo(
    () => onlyVisible(originalProfile),
    [originalProfile],
  );
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function downloadPdf() {
    setDownloading(true);
    setPdfError(null);
    try {
      // Refaz o ajuste com os dados de agora (a análise pode estar 400ms atrasada).
      const current = form.getValues();
      const ready = await preparePdf(onlyVisible(current));
      if (!ready.fitted) {
        setPdfError(
          "O CV passa de 1 página. Enxugue o conteúdo para baixar (veja as sugestões em Espaço da página).",
        );
        return;
      }
      const blob = new Blob([ready.bytes.slice()], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName(profile.fullName);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setPdfError("Não foi possível gerar o PDF. Tente de novo.");
    } finally {
      setDownloading(false);
    }
  }

  const analysis = useAnalysis(profile);
  const prepared = analysis.prepared;
  const doesNotFit = prepared !== null && !prepared.fitted;
  const checks = useMemo(
    () =>
      prepared
        ? runChecks({ profile, cv: prepared.cv, pdf: prepared.measurement })
        : null,
    [profile, prepared],
  );
  const suggestions = useMemo(
    () => (doesNotFit ? suggestTrim(profile) : []),
    [doesNotFit, profile],
  );

  const status = sectionStatuses(originalProfile);
  const index = SECTIONS.findIndex((s) => s.id === active);
  const previous = SECTIONS[index - 1];
  const next = SECTIONS[index + 1];
  const ActiveSection = SECTION_COMPONENT[active];

  const completedCount = SECTIONS.filter((x) => status[x.id].completed).length;
  const withoutName = !profile.fullName.trim();

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
              {state === "saved" && (
                <Icon name="check" size={16} className="text-accent" />
              )}
              {state === "error" && (
                <Icon name="alert" size={16} className="text-warn-icon" />
              )}
              <span className="max-sm:sr-only">{STATE_TEXT[state]}</span>
            </p>
            <ThemeToggle />
            <button
              type="button"
              className={`${BUTTON.primary} min-h-12 px-5`}
              disabled={withoutName || downloading || doesNotFit}
              title={
                withoutName
                  ? "Preencha seu nome para baixar o PDF"
                  : doesNotFit
                    ? "O CV passa de 1 página: enxugue o conteúdo para baixar"
                    : undefined
              }
              onClick={downloadPdf}
            >
              <Icon name="download" size={18} />
              {downloading ? "Gerando…" : "Baixar PDF"}
            </button>
          </div>
          {pdfError && (
            <p
              role="alert"
              className="text-warn-ink bg-warn-bg flex basis-full items-center justify-end gap-1.5 rounded-xl px-3 py-2 text-sm"
            >
              <Icon name="alert" size={16} className="text-warn-icon" />
              {pdfError}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 pt-6 pb-28 sm:px-6 lg:grid-cols-[256px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)_460px] xl:pb-8">
        <div
          className={`space-y-6 lg:sticky lg:top-24 ${
            panel === "previa" ? "max-xl:hidden" : ""
          }`}
        >
          <SectionNav
            active={active}
            status={status}
            completedCount={completedCount}
            onSelect={setActive}
          />
        </div>

        <main
          className={`${CARD} p-5 sm:p-8 lg:p-10 ${
            panel === "previa" ? "max-xl:hidden" : ""
          }`}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            noValidate
            aria-label="Editor do perfil"
          >
            <ActiveSection />
            <div className="border-line mt-10 flex items-center justify-between gap-3 border-t pt-6">
              {previous ? (
                <button
                  type="button"
                  className={BUTTON.secondary}
                  onClick={() => setActive(previous.id)}
                >
                  <Icon name="arrow-left" size={18} />
                  {previous.title}
                </button>
              ) : (
                <span />
              )}
              {next && (
                <button
                  type="button"
                  className={BUTTON.escuro}
                  onClick={() => setActive(next.id)}
                >
                  {next.title}
                  <Icon name="arrow-right" size={18} />
                </button>
              )}
            </div>
          </form>
          <div className="mt-8">{backup}</div>
        </main>

        <aside
          className={`w-full space-y-5 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7.5rem)] xl:overflow-y-auto xl:pr-1 ${
            panel === "editar"
              ? "max-xl:hidden"
              : "max-xl:mx-auto max-xl:max-w-xl lg:col-span-2 xl:col-span-1"
          }`}
        >
          <PageSpace
            measurement={prepared?.measurement ?? null}
            layoutFit={prepared?.layoutFit ?? null}
            fitted={prepared?.fitted ?? true}
            suggestions={suggestions}
          />
          <section aria-labelledby="previa-titulo">
            <h2 id="previa-titulo" className="sr-only">
              Pré-visualização do CV
            </h2>
            <PdfPreview
              bytes={prepared?.bytes ?? null}
              pages={prepared?.measurement.pages ?? null}
              generating={analysis.state === "generating"}
              error={analysis.state === "error"}
            />
          </section>
          <AtsCard checks={checks} />
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
        ).map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={panel === id}
            onClick={() => setPanel(id)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 font-medium whitespace-nowrap transition-colors ${
              panel === id
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            <Icon name={icon} size={18} />
            {label}
          </button>
        ))}
      </div>
    </FormProvider>
  );
};
