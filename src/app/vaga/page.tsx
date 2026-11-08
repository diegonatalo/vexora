"use client";

import { VagaShell } from "@/components/vaga/VagaShell";
import { useDados } from "@/lib/use-dados";

export default function VagaPage() {
  const { dados, estado, atualizar } = useDados();

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
    <VagaShell
      dados={dados}
      onSalvarVersoes={(versoes) => atualizar({ ...dados, versoes })}
    />
  );
}
