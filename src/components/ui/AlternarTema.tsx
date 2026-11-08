"use client";

import { useSyncExternalStore } from "react";
import { BOTAO } from "@/components/ui/estilos";
import { Icon } from "@/components/ui/icons";
import { assinarTema, definirTema, temaAtual, type Tema } from "@/lib/tema";

export function AlternarTema() {
  const tema = useSyncExternalStore<Tema>(
    assinarTema,
    temaAtual,
    () => "claro",
  );
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      className={`${BOTAO.secundario} px-3`}
      aria-pressed={escuro}
      aria-label="Tema escuro"
      title={escuro ? "Voltar ao tema claro" : "Usar o tema escuro"}
      onClick={() => definirTema(escuro ? "claro" : "escuro")}
    >
      <Icon name={escuro ? "sun" : "moon"} size={18} />
    </button>
  );
}
