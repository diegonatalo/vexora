import { Icon } from "@/components/ui/icons";
import { CARTAO } from "@/components/ui/estilos";
import type { Ajuste } from "@/lib/fit";
import type { Medicao } from "@/lib/pdf/medicao";

type Props = {
  /** null enquanto o primeiro PDF é gerado. */
  medicao: Medicao | null;
  ajuste: Ajuste | null;
  coube: boolean;
  /** O que enxugar quando não cabe (tópicos mais longos primeiro). */
  sugestoes: string[];
};

/** Cartão "Espaço da página": barra de uso e aviso de estouro. */
export function EspacoPagina({ medicao, ajuste, coube, sugestoes }: Props) {
  const pct = medicao?.usadoPct ?? 0;
  const estourou = medicao !== null && !coube;

  return (
    <section className={`${CARTAO} p-5`} aria-labelledby="espaco-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="espaco-titulo" className="font-display text-lg font-semibold">
          Espaço da página
        </h2>
        {medicao && <span className="text-sm font-semibold">{pct}% usado</span>}
      </div>

      <div
        role="progressbar"
        aria-label="Espaço da página usado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(pct, 100)}
        aria-valuetext={medicao ? `${pct}% usado` : "Calculando"}
        className="bg-line mt-3 h-2.5 overflow-hidden rounded-full"
      >
        <div
          className={`h-full rounded-full ${estourou ? "bg-warn-icon" : "bg-accent"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {!medicao && (
        <p className="text-muted mt-3 text-sm" role="status">
          Calculando…
        </p>
      )}

      {medicao && !estourou && (
        <p className="text-muted mt-3 text-sm">
          {medicao.linhasLivres > 0
            ? `Restam cerca de ${medicao.linhasLivres} ${
                medicao.linhasLivres === 1 ? "linha" : "linhas"
              } antes de estourar a página.`
            : "A página está cheia."}
        </p>
      )}

      {medicao && ajuste && ajuste.nivel > 0 && !estourou && (
        <p className="text-muted mt-1 text-sm">
          Ajuste automático para caber em 1 página: {ajuste.descricao}.
        </p>
      )}

      {estourou && (
        <div
          role="alert"
          className="bg-warn-bg text-warn-ink rounded-field mt-3 flex items-start gap-2.5 p-3 text-sm"
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
            {sugestoes.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {sugestoes.map((s) => (
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
