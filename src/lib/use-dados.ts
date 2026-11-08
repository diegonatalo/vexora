"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { carregarDados, salvarDados, type Dados } from "@/lib/storage";

export type EstadoSalvamento = "carregando" | "salvando" | "salvo" | "erro";

const ATRASO_SALVAR_MS = 400;

/**
 * Mantém os dados do usuário em memória e persiste no navegador (IndexedDB)
 * com debounce. `dados` é null até a primeira carga terminar. Gravações
 * pendentes são descarregadas ao sair da tela ou fechar a aba.
 */
export function useDados() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [estado, setEstado] = useState<EstadoSalvamento>("carregando");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendente = useRef<Dados | null>(null);

  const descarregar = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    const proximo = pendente.current;
    if (!proximo) return;
    pendente.current = null;
    salvarDados(proximo)
      .then(() => setEstado("salvo"))
      .catch(() => setEstado("erro"));
  }, []);

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

  useEffect(() => {
    window.addEventListener("pagehide", descarregar);
    return () => {
      window.removeEventListener("pagehide", descarregar);
      descarregar();
    };
  }, [descarregar]);

  const atualizar = useCallback(
    (proximo: Dados) => {
      setDados(proximo);
      setEstado("salvando");
      pendente.current = proximo;
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(descarregar, ATRASO_SALVAR_MS);
    },
    [descarregar],
  );

  return { dados, estado, atualizar };
}
