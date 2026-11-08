"use client";

import { Icon } from "@/components/ui/icons";
import { CARTAO } from "@/components/ui/estilos";
import { SECOES, type SecaoId, type StatusSecao } from "@/lib/secoes";

export function SectionNav({
  ativa,
  status,
  onSelecionar,
}: {
  ativa: SecaoId;
  status: Record<SecaoId, StatusSecao>;
  onSelecionar: (id: SecaoId) => void;
}) {
  return (
    <nav aria-labelledby="secoes-titulo" className={`${CARTAO} p-4`}>
      <h2
        id="secoes-titulo"
        className="text-muted mb-2 px-3 text-xs font-semibold tracking-widest uppercase"
      >
        Seções
      </h2>
      <ul className="space-y-1">
        {SECOES.map(({ id, titulo }) => {
          const s = status[id];
          const ehAtiva = id === ativa;
          const icone = ehAtiva
            ? "dot-circle"
            : s.concluida
              ? "check-circle"
              : "circle";
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelecionar(id)}
                aria-current={ehAtiva ? "step" : undefined}
                className={`rounded-field flex min-h-11 w-full items-center gap-3 px-3 text-left ${
                  ehAtiva ? "bg-accent-soft text-accent-deep font-semibold" : ""
                }`}
              >
                <Icon
                  name={icone}
                  size={22}
                  className={
                    ehAtiva || s.concluida ? "text-accent" : "text-field"
                  }
                />
                <span className="flex-1">{titulo}</span>
                {s.contador && (
                  <span className="text-muted text-sm font-normal">
                    {s.contador}
                  </span>
                )}
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
