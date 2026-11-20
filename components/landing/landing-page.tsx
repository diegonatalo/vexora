import Link from "next/link";
import { LandingHeader } from "@/components/landing/landing-header";
import { Screenshot } from "@/components/landing/screenshot";
import { SiteFooter } from "@/components/site-footer";
import { Icon } from "@/components/ui/icons";
import { BUTTON, CARD, KICKER } from "@/components/ui/styles";
import { FAQ, FEATURES, HERO, STEPS } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const SECTION = "mx-auto w-full max-w-6xl px-4 sm:px-6";
const H2 = "font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl";

/** Página inicial: apresenta o Vexora e leva ao editor (`/app`). */
export const LandingPage = () => (
  <>
    <LandingHeader />
    <main id="conteudo" className="flex flex-1 flex-col gap-24 pb-24">
      <section className={`${SECTION} flex flex-col gap-10 pt-14 sm:pt-20`} aria-labelledby="titulo">
        <div className="flex max-w-3xl flex-col gap-5">
          <p className={KICKER}>{HERO.kicker}</p>
          <h1 id="titulo" className="font-display text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {HERO.title}
          </h1>
          <p className="text-muted text-lg text-pretty">{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={`${BUTTON.primary} min-h-12 px-6`}>
              <Icon name="pencil" size={18} />
              Criar meu currículo
            </Link>
            <a href="#como-funciona" className={`${BUTTON.secondary} min-h-12 px-6`}>
              Ver como funciona
            </a>
          </div>
          <p className="text-muted text-sm">{HERO.note}</p>
        </div>
        <Screenshot priority />
      </section>

      <section id="como-funciona" className={`${SECTION} scroll-mt-24`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`${CARD} flex flex-col gap-3 p-6`}>
              <span className="bg-accent-soft text-accent-deep font-display grid size-10 place-items-center rounded-xl text-lg font-bold">
                {index + 1}
              </span>
              <h3 className="font-display text-xl font-semibold">{step.title}</h3>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Feito para chegar até uma pessoa
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className={`${CARD} flex flex-col gap-2 p-6`}>
              <Icon name={feature.icon} size={24} className="text-accent" />
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="text-muted text-sm">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={SECTION} aria-labelledby="titulo-privacidade">
        <div className="bg-accent-soft flex flex-col gap-3 rounded-card p-8 sm:p-10">
          <Icon name="shield" size={28} className="text-accent-deep" />
          <h2 id="titulo-privacidade" className={H2}>
            Seus dados não saem do seu navegador
          </h2>
          <p className="max-w-2xl text-pretty">
            O perfil fica guardado só neste navegador, e o PDF é gerado aqui mesmo. Não há conta, servidor de
            currículos nem cookies de rastreamento.{" "}
            <Link href="/privacidade" className="text-accent-deep font-semibold underline underline-offset-2">
              Leia a política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={SECTION} aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas frequentes
        </h2>
        <dl className="mt-8 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question} className={`${CARD} p-6`}>
              <dt className="font-display text-lg font-semibold">{item.question}</dt>
              <dd className="text-muted mt-2">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${SECTION} text-center`} aria-labelledby="titulo-final">
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
