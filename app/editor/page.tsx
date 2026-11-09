"use client";

import { useState } from "react";
import { ProfileBackup } from "@/components/editor/profile-backup";
import { EditorShell } from "@/components/editor/editor-shell";
import { useData } from "@/hooks/use-data";

export default function EditorPage() {
  const { data, state, update } = useData();
  // Muda a cada importação para remontar o formulário com os dados novos.
  const [generation, setGeneration] = useState(0);

  if (!data) {
    return (
      <p className="p-6" role="status" aria-busy="true">
        {state === "error"
          ? "Não foi possível abrir o armazenamento deste navegador."
          : "Carregando…"}
      </p>
    );
  }

  return (
    <EditorShell
      key={generation}
      initialData={data}
      state={state}
      onChange={update}
      backup={
        <ProfileBackup
          data={data}
          onImport={(imported) => {
            update(imported);
            setGeneration((g) => g + 1);
          }}
        />
      }
    />
  );
}
