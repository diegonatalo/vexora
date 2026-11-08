"use client";

import { useState } from "react";
import { BackupPerfil } from "@/components/editor/BackupPerfil";
import { EditorShell } from "@/components/editor/EditorShell";
import { SECOES, type SecaoId } from "@/lib/secoes";
import { useDados } from "@/lib/use-dados";

/** `/editor?secao=habilidades` abre direto naquela seção. */
function secaoDaUrl(): SecaoId | undefined {
  const valor = new URLSearchParams(window.location.search).get("secao");
  return SECOES.find((s) => s.id === valor)?.id;
}

export default function EditorPage() {
  const { dados, estado, atualizar } = useDados();
  // Muda a cada importação para remontar o formulário com os dados novos.
  const [geracao, setGeracao] = useState(0);

  if (!dados) {
    return (
      <p className="p-6" role="status" aria-busy="true">
        {estado === "erro"
          ? "Não foi possível abrir o armazenamento deste navegador."
          : "Carregando…"}
      </p>
    );
  }

  return (
    <EditorShell
      key={geracao}
      secaoInicial={secaoDaUrl()}
      dadosIniciais={dados}
      estado={estado}
      onAlterar={atualizar}
      backup={
        <BackupPerfil
          dados={dados}
          onImportar={(importados) => {
            atualizar(importados);
            setGeracao((g) => g + 1);
          }}
        />
      }
    />
  );
}
