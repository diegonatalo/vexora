"use client";

import { useEffect, useState } from "react";
import { preparePdf, type Prepared } from "@/lib/pdf/prepare";
import type { Profile } from "@/lib/schema";

const DEBOUNCE_MS = 400;

export type Analysis = {
  state: "generating" | "ready" | "error";
  /** Último resultado pronto; fica disponível enquanto o próximo é gerado. */
  prepared: Prepared | null;
};

/**
 * Gera o PDF do perfil (com o ajuste de página) após uma pausa na digitação.
 * Mantém o último resultado na tela enquanto o novo é calculado.
 */
export function useAnalysis(profile: Profile): Analysis {
  const [result, setResult] = useState<{
    prepared: Prepared | null;
    from: Profile | null;
    error: boolean;
  }>({ prepared: null, from: null, error: false });

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      preparePdf(profile)
        .then((prepared) => {
          if (!cancelled) setResult({ prepared, from: profile, error: false });
        })
        .catch(() => {
          if (!cancelled) {
            setResult((r) => ({ ...r, from: profile, error: true }));
          }
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [profile]);

  const state =
    result.from !== profile ? "generating" : result.error ? "error" : "ready";
  return { state, prepared: result.prepared };
}
