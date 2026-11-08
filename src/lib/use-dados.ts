"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { carregarDados, salvarDados, type Dados } from "@/lib/storage";

export type EstadoSalvamento = "carregando" | "salvando" | "salvo" | "erro";

const ATRASO_SALVAR_MS = 400;

/**
 * Mantém os dados do usuário em memória e persiste no navegador (IndexedDB)
 * com debounce. `dados` é null até a primeira carga terminar.
 */
export function useDados() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [estado, setEstado] = useState<EstadoSalvamento>("carregando");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelado = false;
    carregarDados()
      .then((d) => {
        if (cancelado) return;
        setDados(d);
        setEstado("salvo");
      })
      .catch(() => {
        if (!cancelado) setEstado("erro");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const atualizar = useCallback((proximo: Dados) => {
    setDados(proximo);
    setEstado("salvando");
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      salvarDados(proximo)
        .then(() => setEstado("salvo"))
        .catch(() => setEstado("erro"));
    }, ATRASO_SALVAR_MS);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  return { dados, estado, atualizar };
}
