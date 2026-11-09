"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadData, saveData, type AppData } from "@/lib/storage";

export type SaveState = "loading" | "saving" | "saved" | "error";

const SAVE_DELAY_MS = 400;

/**
 * Mantém os dados do usuário em memória e persiste no navegador (IndexedDB)
 * com debounce. `dados` é null até a primeira carga terminar. Gravações
 * pendentes são descarregadas ao sair da tela ou fechar a aba.
 */
export function useData() {
  const [data, setData] = useState<AppData | null>(null);
  const [state, setState] = useState<SaveState>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<AppData | null>(null);

  const discard = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const nextItem = pending.current;
    if (!nextItem) return;
    pending.current = null;
    saveData(nextItem)
      .then(() => setState("saved"))
      .catch(() => setState("error"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setState("saved");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    window.addEventListener("pagehide", discard);
    return () => {
      window.removeEventListener("pagehide", discard);
      discard();
    };
  }, [discard]);

  const update = useCallback(
    (nextItem: AppData) => {
      setData(nextItem);
      setState("saving");
      pending.current = nextItem;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(discard, SAVE_DELAY_MS);
    },
    [discard],
  );

  return { data, state, update };
}
