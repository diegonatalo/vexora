"use client";

import { useRef } from "react";
import { BUTTON } from "@/components/ui/styles";
import { Icon } from "@/components/ui/icons";
import { exportJson, importJson, type AppData } from "@/lib/storage";

type ProfileBackupProps = {
  data: AppData;
  onImport: (data: AppData) => void;
  /** Fica com quem usa o componente: a importação remonta o editor e apagaria um estado local. */
  message: string | null;
  onMessage: (message: string | null) => void;
};

export const ProfileBackup = ({ data, onImport, message, onMessage: setMessage }: ProfileBackupProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  function startDownload() {
    const blob = new Blob([exportJson(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vexora-perfil.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onChoose(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const result = importJson(await file.text());
    if (result.ok) {
      onImport(result.data);
      setMessage("Perfil importado.");
    } else {
      setMessage(result.error);
    }
  }

  return (
    <section
      className="border-line bg-sunken/60 rounded-2xl border p-5"
      aria-labelledby="backup-title"
    >
      <h2
        id="backup-title"
        className="font-display flex items-center gap-2 text-lg font-semibold"
      >
        <Icon name="shield" size={20} className="text-accent" />
        Backup do perfil
      </h2>
      <p className="text-muted mt-1.5 text-sm">
        Seus dados ficam só neste navegador. Exporte para guardar ou levar para
        outro computador. O arquivo tem tudo o que você preencheu (nome,
        contato, experiências): guarde em lugar seguro.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={BUTTON.secondary} onClick={startDownload}>
          <Icon name="download" size={18} />
          Exportar (JSON)
        </button>
        <button
          type="button"
          className={BUTTON.secondary}
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="upload" size={18} />
          Importar (JSON)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Arquivo de perfil JSON"
          onChange={onChoose}
        />
      </div>
      {message && (
        <p className="mt-3 text-sm" role="status">
          {message}
        </p>
      )}
    </section>
  );
};
