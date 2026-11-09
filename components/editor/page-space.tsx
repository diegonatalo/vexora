import { Icon } from "@/components/ui/icons";
import { CARD } from "@/components/ui/styles";
import type { LayoutFit } from "@/lib/fit";
import type { Measurement } from "@/lib/pdf/measurement";

type Props = {
  /** null enquanto o primeiro PDF é gerado. */
  measurement: Measurement | null;
  layoutFit: LayoutFit | null;
  fitted: boolean;
  /** O que enxugar quando não cabe (tópicos mais longos primeiro). */
  suggestions: string[];
};

/** Cartão "Espaço da página": barra de uso e aviso de estouro. */
export function PageSpace({ measurement, layoutFit, fitted, suggestions }: Props) {
  const pct = measurement?.usedPct ?? 0;
  const overflowed = measurement !== null && !fitted;

  return (
    <section className={`${CARD} p-5`} aria-labelledby="espaco-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="espaco-titulo" className="font-display text-lg font-semibold">
          Espaço da página
        </h2>
        {measurement && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
              overflowed
                ? "bg-warn-bg text-warn-ink"
                : "bg-accent-soft text-accent-deep"
            }`}
          >
            {pct}% usado
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-label="Espaço da página usado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(pct, 100)}
        aria-valuetext={measurement ? `${pct}% usado` : "Calculando"}
        className="bg-line mt-3 h-2.5 overflow-hidden rounded-full"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${overflowed ? "bg-warn-icon" : "bg-accent"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {!measurement && (
        <p className="text-muted mt-3 text-sm" role="status">
          Calculando…
        </p>
      )}

      {measurement && !overflowed && (
        <p className="text-muted mt-3 text-sm">
          {measurement.freeLines > 0
            ? `Restam cerca de ${measurement.freeLines} ${
                measurement.freeLines === 1 ? "linha" : "linhas"
              } antes de estourar a página.`
            : "A página está cheia."}
        </p>
      )}

      {measurement && layoutFit && layoutFit.level > 0 && !overflowed && (
        <p className="text-muted mt-1 text-sm">
          Ajuste automático para caber em 1 página: {layoutFit.description}.
        </p>
      )}

      {overflowed && (
        <div
          role="alert"
          className="bg-warn-bg text-warn-ink mt-3 flex items-start gap-2.5 rounded-xl p-3.5 text-sm"
        >
          <Icon
            name="alert"
            size={18}
            className="text-warn-icon mt-0.5 shrink-0"
          />
          <div>
            <p>
              <strong className="font-semibold">O CV passa de 1 página</strong>{" "}
              mesmo no layout mais compacto. Nada foi cortado: enxugue o
              conteúdo para poder baixar.
            </p>
            {suggestions.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
