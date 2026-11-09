import { Icon } from "@/components/ui/icons";
import { CARD } from "@/components/ui/styles";
import type { Check } from "@/lib/ats/checks";

/** Cartão "Verificação ATS". `checagens` é null enquanto o PDF é gerado. */
export function AtsCard({ checks }: { checks: Check[] | null }) {
  const ok = checks?.filter((c) => c.ok) ?? [];
  const failures = checks?.filter((c) => !c.ok) ?? [];

  return (
    <section className={`${CARD} p-5`} aria-labelledby="ats-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="ats-titulo"
          className="font-display flex items-center gap-2 text-lg font-semibold"
        >
          <Icon name="shield" size={20} className="text-accent" />
          Verificação ATS
        </h2>
        {checks && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
              failures.length === 0
                ? "bg-accent-soft text-accent-deep"
                : "bg-warn-bg text-warn-ink"
            }`}
          >
            {ok.length} de {checks.length} ok
          </span>
        )}
      </div>

      {!checks && (
        <p className="text-muted mt-3 text-sm" role="status">
          Verificando…
        </p>
      )}

      {checks && (
        <>
          <ul className="mt-3 space-y-2.5">
            {ok.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 text-sm">
                <span
                  aria-hidden="true"
                  className="bg-accent-soft text-accent-deep mt-0.5 grid size-5 shrink-0 place-items-center rounded-full"
                >
                  <Icon name="check" size={12} />
                </span>
                <span>
                  <span className="sr-only">Ok: </span>
                  {c.title}
                </span>
              </li>
            ))}
          </ul>
          {failures.length > 0 && (
            <ul className="mt-3 space-y-2.5" aria-label="Ajustes recomendados">
              {failures.map((c) => (
                <li
                  key={c.id}
                  className="bg-warn-bg text-warn-ink flex items-start gap-2.5 rounded-xl p-3.5 text-sm"
                >
                  <Icon
                    name="alert"
                    size={18}
                    className="text-warn-icon mt-0.5 shrink-0"
                  />
                  <span>
                    <span className="sr-only">
                      {c.severity === "warning" ? "Aviso: " : "Corrigir: "}
                    </span>
                    <strong className="font-semibold">{c.problem}</strong>{" "}
                    {c.fix}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
