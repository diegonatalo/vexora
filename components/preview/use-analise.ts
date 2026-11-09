"use client";

import { useEffect, useState } from "react";
import { prepararPdf, type Preparado } from "@/lib/pdf/preparar";
import type { Perfil } from "@/lib/schema";

const DEBOUNCE_MS = 400;

export type Analise = {
  estado: "gerando" | "pronto" | "erro";
  /** Último resultado pronto; fica disponível enquanto o próximo é gerado. */
  preparado: Preparado | null;
};

/**
 * Gera o PDF do perfil (com o ajuste de página) após uma pausa na digitação.
 * Mantém o último resultado na tela enquanto o novo é calculado.
 */
export function useAnalise(perfil: Perfil): Analise {
  const [resultado, setResultado] = useState<{
    preparado: Preparado | null;
    de: Perfil | null;
    erro: boolean;
  }>({ preparado: null, de: null, erro: false });

  useEffect(() => {
    let cancelado = false;
    const temporizador = setTimeout(() => {
      prepararPdf(perfil)
        .then((preparado) => {
          if (!cancelado) setResultado({ preparado, de: perfil, erro: false });
        })
        .catch(() => {
          if (!cancelado) {
            setResultado((r) => ({ ...r, de: perfil, erro: true }));
          }
        });
    }, DEBOUNCE_MS);
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [perfil]);

  const estado =
    resultado.de !== perfil ? "gerando" : resultado.erro ? "erro" : "pronto";
  return { estado, preparado: resultado.preparado };
}
