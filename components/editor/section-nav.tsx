"use client";

import { Icon } from "@/components/ui/icons";
import { CARD, KICKER } from "@/components/ui/styles";
import { SECTIONS, type SectionId, type SectionStatus } from "@/lib/sections";

export const SectionNav = ({
  active,
  status,
  completedCount,
  onSelect,
}: {
  active: SectionId;
  status: Record<SectionId, SectionStatus>;
  /** Quantas seções já estão completas (barra de progresso). */
  completedCount: number;
  onSelect: (id: SectionId) => void;
}) => {
  const total = SECTIONS.length;
  const pct = Math.round((completedCount / total) * 100);
  return (
    <nav aria-labelledby="secoes-titulo" className={`${CARD} p-4`}>
      <div className="mb-3 flex items-baseline justify-between px-2">
        <h2 id="secoes-titulo" className={KICKER}>
          Seções
        </h2>
        <span className="text-muted text-xs font-medium">
          {completedCount} de {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Seções concluídas"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completedCount}
        className="bg-line mx-2 mb-4 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="bg-accent h-full rounded-full transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="relative -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        {SECTIONS.map(({ id, title }, i) => {
          const s = status[id];
          const isActive = id === active;
          return (
            <li key={id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? "step" : undefined}
                className={`rounded-field flex min-h-11 w-full items-center gap-3 px-2.5 py-1.5 text-left whitespace-nowrap transition-colors duration-150 lg:whitespace-normal ${
                  isActive
                    ? "bg-accent-soft text-accent-deep font-semibold"
                    : "hover:bg-sunken"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-accent text-on-accent"
                      : s.completed
                        ? "bg-accent-soft text-accent-deep"
                        : "border-line text-muted border"
                  }`}
                >
                  {s.completed && !isActive ? (
                    <Icon name="check" size={14} strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="flex-1">{title}</span>
                <span className="sr-only">
                  {s.completed ? " (concluída)" : " (incompleta)"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
