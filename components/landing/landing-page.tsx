import Image from "next/image";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { Screenshot } from "@/components/landing/screenshot";
import { SiteFooter } from "@/components/site-footer";
import { Icon } from "@/components/ui/icons";
import { BUTTON, CARD, KICKER } from "@/components/ui/styles";
import { ATS_CHECKS, FAQ, FEATURES, HERO, PHOTO, STEPS } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const SECTION = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const H2 = "font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl";
/** Título de seção como o do PDF: caixa alta e um fio embaixo. */
const CV_HEADING = "border-b border-ink/70 pb-1 text-[0.7rem] font-bold tracking-[0.16em] uppercase";

/** Linhas cinzas que fazem as vezes de texto nos currículos desenhados. */
const Lines = ({ widths }: { widths: string[] }) => (
  <div className="space-y-1.5" aria-hidden="true">
    {widths.map((w, i) => (
      <div key={i} className="h-1.5 rounded-full bg-field/40" style={{ width: w }} />
    ))}
  </div>
);

/** Currículo de duas colunas, com ícones e barras: o que o ATS costuma embaralhar. */
const TwoColumnCv = () => (
  <div className="mx-auto grid aspect-[1/1.3] max-w-[15rem] grid-cols-[38%_1fr] overflow-hidden rounded-lg bg-white text-zinc-900 shadow-sheet">
    <div className="flex flex-col gap-3 bg-[#2d3b55] p-3">
      <div className="mx-auto size-10 rounded-full bg-white/30" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-300" />
          <div className="h-1.5 flex-1 rounded-full bg-white/40" />
        </div>
      ))}
      <div className="mt-2 space-y-1.5">
        {["80%", "55%", "70%"].map((w) => (
          <div key={w} className="h-1.5 rounded-full bg-white/20">
            <div className="h-1.5 rounded-full bg-amber-300" style={{ width: w }} />
          </div>
        ))}
      </div>
    </div>
    <div className="flex flex-col gap-3 p-3">
      <div className="h-3 w-3/4 rounded bg-[#2d3b55]" />
      <Lines widths={["100%", "90%", "95%"]} />
      <div className="grid grid-cols-2 gap-2">
        <Lines widths={["100%", "70%", "85%"]} />
        <Lines widths={["90%", "100%", "60%"]} />
      </div>
      <Lines widths={["95%", "80%", "90%", "70%"]} />
      <div className="grid grid-cols-2 gap-2">
        <Lines widths={["80%", "100%"]} />
        <Lines widths={["100%", "65%"]} />
      </div>
    </div>
  </div>
);

/** Currículo de coluna única, como o que o Vexora gera. */
const SingleColumnCv = () => (
  <div className="mx-auto flex aspect-[1/1.3] max-w-[15rem] flex-col gap-2.5 overflow-hidden rounded-lg bg-white p-4 text-zinc-900 shadow-sheet">
    <div className="h-3 w-1/2 rounded bg-zinc-900" />
    <div className="h-1.5 w-1/3 rounded-full bg-zinc-400" />
    {["RESUMO", "EXPERIÊNCIA", "FORMAÇÃO", "HABILIDADES"].map((title) => (
      <div key={title} className="space-y-1.5">
        <p className="border-b border-zinc-800 pb-0.5 text-[0.5rem] font-bold tracking-[0.14em]">{title}</p>
        <Lines widths={["100%", "92%", "75%"]} />
      </div>
    ))}
  </div>
);

/** Página inicial: apresenta o Vexora e leva ao editor (`/app`). */
export const LandingPage = () => (
  <>
    <LandingHeader />
    <main id="conteudo" className="flex flex-1 flex-col">
      <section className="bg-stage" aria-labelledby="titulo">
        <div className={`${SECTION} grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr]`}>
          <div className="flex flex-col gap-5">
            <p className={KICKER}>{HERO.kicker}</p>
            <h1 id="titulo" className="font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Seu currículo passa pelo robô e <span className="text-accent">chega no recrutador.</span>
            </h1>
            <p className="text-muted text-lg text-pretty">{HERO.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app" className={`${BUTTON.primary} min-h-12 px-6`}>
                <Icon name="pencil" size={18} />
                Criar meu currículo
              </Link>
              <a href="#antes-depois" className={`${BUTTON.secondary} min-h-12 px-6`}>
                Por que coluna única?
              </a>
            </div>
            <p className="text-muted text-sm">{HERO.note}</p>
          </div>

          {/* Foto de quem o currículo quer alcançar, com a verificação ATS do editor por cima. */}
          <div className="relative sm:pb-16 lg:pb-0">
            <Image
              src={PHOTO.src}
              alt={PHOTO.alt}
              width={1600}
              height={1067}
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              className="aspect-[4/3] w-full rounded-card object-cover shadow-sheet"
            />
            <div className={`${CARD} mt-4 p-4 sm:absolute sm:-bottom-2 sm:-left-8 sm:mt-0 sm:w-72 lg:-bottom-10`}>
              <p className={KICKER}>Verificação ATS</p>
              <ul className="mt-3 space-y-2 text-sm">
                {ATS_CHECKS.map((check) => (
                  <li key={check} className="flex items-start gap-2">
                    <Icon name="check" size={16} className="text-accent mt-0.5 shrink-0" />
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="antes-depois" className={`${SECTION} scroll-mt-24 py-24`} aria-labelledby="titulo-antes">
        <h2 id="titulo-antes" className={`${H2} max-w-2xl`}>
          O robô lê o texto do PDF, não o desenho
        </h2>
        <p className="text-muted mt-3 max-w-2xl">
          Colunas, ícones e barras de habilidade deixam o currículo bonito, mas o sistema de triagem lê o texto na ordem
          em que ele aparece no arquivo e costuma embaralhar tudo.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <figure className="flex flex-col gap-4">
            <div className="bg-warn-bg rounded-card p-6 sm:p-10">
              <TwoColumnCv />
            </div>
            <figcaption className="flex items-start gap-2">
              <Icon name="alert" size={20} className="text-warn-icon mt-0.5 shrink-0" />
              <span>
                <strong>Duas colunas, ícones e barras:</strong>{" "}
                <span className="text-muted">o ATS mistura as colunas e ignora o que é imagem.</span>
              </span>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-4">
            <div className="bg-accent-soft rounded-card p-6 sm:p-10">
              <SingleColumnCv />
            </div>
            <figcaption className="flex items-start gap-2">
              <Icon name="check-circle" size={20} className="text-accent mt-0.5 shrink-0" />
              <span>
                <strong>Coluna única, títulos padrão:</strong>{" "}
                <span className="text-muted">o texto sai na ordem certa, do jeito que o Vexora gera.</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-stage py-24" aria-labelledby="titulo-como">
        <div className={SECTION}>
          <h2 id="titulo-como" className={H2}>
            Três passos até o PDF
          </h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex flex-col gap-3 border-t-2 border-dashed border-field pt-6">
                <span className="font-display text-accent absolute -top-4 left-0 bg-stage pr-3 text-2xl font-bold">
                  0{index + 1}
                </span>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <Screenshot />
          </div>
        </div>
      </section>

      {/* Os recursos apresentados como uma folha de currículo. */}
      <section className={`${SECTION} py-24`} aria-labelledby="titulo-recursos">
        <div className="bg-surface mx-auto max-w-3xl rounded-sm p-8 text-ink shadow-sheet sm:p-14">
          <h2 id="titulo-recursos" className="font-display text-3xl font-bold tracking-tight">
            Vexora
          </h2>
          <p className="text-muted mt-1">Currículo de 1 página para ATS · grátis · sem cadastro</p>
          <div className="mt-8 space-y-7">
            {FEATURES.map((feature) => (
              <div key={feature.title}>
                <h3 className={CV_HEADING}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent-soft" aria-labelledby="titulo-faq">
        <div className={`${SECTION} grid gap-10 py-20 lg:grid-cols-[1fr_1.5fr]`}>
          <div className="flex flex-col gap-4">
            <h2 id="titulo-faq" className={H2}>
              Perguntas frequentes
            </h2>
            <p className="text-sm">
              Seus dados não saem do seu navegador: o perfil fica guardado aqui e o PDF é gerado aqui mesmo.{" "}
              <Link href="/privacidade" className="text-accent-deep font-semibold underline underline-offset-2">
                Leia a política de privacidade
              </Link>
              .
            </p>
          </div>
          <dl className="divide-ink/15 border-ink/15 divide-y border-y">
            {FAQ.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="font-display text-lg font-semibold">{item.question}</dt>
                <dd className="text-muted mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${SECTION} py-24 text-center`} aria-labelledby="titulo-final">
        <h2 id="titulo-final" className={H2}>
          Pronto para montar o seu?
        </h2>
        <p className="text-muted mx-auto mt-3 max-w-xl">Leva alguns minutos, e você pode voltar quando quiser.</p>
        <Link href="/app" className={`${BUTTON.primary} mt-6 min-h-12 px-6`}>
          Criar meu currículo
        </Link>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </>
);
