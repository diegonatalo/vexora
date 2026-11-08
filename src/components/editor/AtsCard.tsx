import { Icon } from "@/components/ui/icons";
import { CARTAO } from "@/components/ui/estilos";
import type { Checagem } from "@/lib/ats/checks";

/** Cartão "Verificação ATS". `checagens` é null enquanto o PDF é gerado. */
export function AtsCard({ checagens }: { checagens: Checagem[] | null }) {
  const ok = checagens?.filter((c) => c.ok) ?? [];
  const falhas = checagens?.filter((c) => !c.ok) ?? [];

  return (
    <section className={`${CARTAO} p-5`} aria-labelledby="ats-titulo">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="ats-titulo"
          className="font-display flex items-center gap-2 text-lg font-semibold"
        >
          <Icon name="shield" size={20} className="text-accent" />
          Verificação ATS
        </h2>
        {checagens && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${
              falhas.length === 0
                ? "bg-accent-soft text-accent-deep"
                : "bg-warn-bg text-warn-ink"
            }`}
          >
            {ok.length} de {checagens.length} ok
          </span>
        )}
      </div>

      {!checagens && (
        <p className="text-muted mt-3 text-sm" role="status">
          Verificando…
        </p>
      )}

      {checagens && (
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
                  {c.titulo}
                </span>
              </li>
            ))}
          </ul>
          {falhas.length > 0 && (
            <ul className="mt-3 space-y-2.5" aria-label="Ajustes recomendados">
              {falhas.map((c) => (
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
                      {c.severidade === "aviso" ? "Aviso: " : "Corrigir: "}
                    </span>
                    <strong className="font-semibold">{c.problema}</strong>{" "}
                    {c.correcao}
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
