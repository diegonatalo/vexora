"use client";

import { useRef, useState } from "react";
import { BOTAO, CARTAO } from "@/components/ui/estilos";
import { exportarJson, importarJson, type Dados } from "@/lib/storage";

export function BackupPerfil({
  dados,
  onImportar,
}: {
  dados: Dados;
  onImportar: (dados: Dados) => void;
}) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  function baixar() {
    const blob = new Blob([exportarJson(dados)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folha-perfil.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const resultado = importarJson(await arquivo.text());
    if (resultado.ok) {
      onImportar(resultado.dados);
      setMensagem("Perfil importado.");
    } else {
      setMensagem(resultado.erro);
    }
  }

  return (
    <section className={`${CARTAO} p-5`} aria-labelledby="backup-titulo">
      <h2 id="backup-titulo" className="font-display text-lg font-semibold">
        Backup do perfil
      </h2>
      <p className="text-muted mt-1 text-sm">
        Seus dados ficam só neste navegador. Exporte para guardar ou levar para
        outro computador.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <button type="button" className={BOTAO.secundario} onClick={baixar}>
          Exportar (JSON)
        </button>
        <button
          type="button"
          className={BOTAO.secundario}
          onClick={() => arquivoRef.current?.click()}
        >
          Importar (JSON)
        </button>
        <input
          ref={arquivoRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Arquivo de perfil JSON"
          onChange={aoEscolher}
        />
      </div>
      {mensagem && (
        <p className="mt-3 text-sm" role="status">
          {mensagem}
        </p>
      )}
    </section>
  );
}
