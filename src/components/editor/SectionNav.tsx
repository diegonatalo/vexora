"use client";

import { Icon } from "@/components/ui/icons";
import { CARTAO, SOBRETITULO } from "@/components/ui/estilos";
import { SECOES, type SecaoId, type StatusSecao } from "@/lib/secoes";

export function SectionNav({
  ativa,
  status,
  concluidas,
  onSelecionar,
}: {
  ativa: SecaoId;
  status: Record<SecaoId, StatusSecao>;
  /** Quantas seções já estão completas (barra de progresso). */
  concluidas: number;
  onSelecionar: (id: SecaoId) => void;
}) {
  const total = SECOES.length;
  const pct = Math.round((concluidas / total) * 100);
  return (
    <nav aria-labelledby="secoes-titulo" className={`${CARTAO} p-4`}>
      <div className="mb-3 flex items-baseline justify-between px-2">
        <h2 id="secoes-titulo" className={SOBRETITULO}>
          Seções
        </h2>
        <span className="text-muted text-xs font-medium">
          {concluidas} de {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Seções concluídas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={concluidas}
        className="bg-line mx-2 mb-4 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="bg-accent h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {SECOES.map(({ id, titulo }, i) => {
          const s = status[id];
          const ehAtiva = id === ativa;
          return (
            <li key={id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelecionar(id)}
                aria-current={ehAtiva ? "step" : undefined}
                className={`rounded-field flex min-h-11 w-full items-center gap-3 px-2.5 py-1.5 text-left whitespace-nowrap transition-colors duration-150 lg:whitespace-normal ${
                  ehAtiva
                    ? "bg-accent-soft text-accent-deep font-semibold"
                    : "hover:bg-sunken"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                    ehAtiva
                      ? "bg-accent text-on-accent"
                      : s.concluida
                        ? "bg-accent-soft text-accent-deep"
                        : "border-line text-muted border"
                  }`}
                >
                  {s.concluida && !ehAtiva ? (
                    <Icon name="check" size={14} strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="flex-1">{titulo}</span>
                <span className="sr-only">
                  {s.concluida ? " (concluída)" : " (incompleta)"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
