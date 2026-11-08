"use client";

import { useRef, useState } from "react";
import { exportarJson, importarJson } from "@/lib/storage";
import { useDados, type EstadoSalvamento } from "@/lib/use-dados";

const TEXTO_ESTADO: Record<EstadoSalvamento, string> = {
  carregando: "Carregando…",
  salvando: "Salvando…",
  salvo: "Salvo neste navegador",
  erro: "Não foi possível salvar neste navegador",
};

const CAMPO =
  "min-h-11 w-full rounded-field border border-field bg-surface px-3 text-ink";
const BOTAO_SECUNDARIO =
  "min-h-11 rounded-field border border-field bg-surface px-4 font-medium text-ink";

// Tela provisória da Fase 1: só prova a persistência e o JSON.
// O editor completo (3 colunas) é a Fase 2.
export default function EditorPage() {
  const { dados, estado, atualizar } = useDados();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  if (!dados) {
    return (
      <main className="p-6" aria-busy="true">
        {TEXTO_ESTADO[estado]}
      </main>
    );
  }

  function baixarJson() {
    if (!dados) return;
    const blob = new Blob([exportarJson(dados)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "folha-perfil.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const resultado = importarJson(await arquivo.text());
    if (resultado.ok) {
      atualizar(resultado.dados);
      setMensagem("Perfil importado.");
    } else {
      setMensagem(resultado.erro);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl p-6">
      <h1 className="font-display text-3xl font-bold">Folha</h1>
      <p className="text-muted mt-1">
        Seus dados ficam apenas neste navegador.
      </p>

      <section className="rounded-card border-line bg-surface mt-6 space-y-4 border p-6">
        <div>
          <label htmlFor="nome" className="mb-1 block font-medium">
            Nome completo
          </label>
          <input
            id="nome"
            className={CAMPO}
            value={dados.perfil.nomeCompleto}
            onChange={(e) =>
              atualizar({
                ...dados,
                perfil: { ...dados.perfil, nomeCompleto: e.target.value },
              })
            }
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            className={CAMPO}
            value={dados.perfil.email}
            onChange={(e) =>
              atualizar({
                ...dados,
                perfil: { ...dados.perfil, email: e.target.value },
              })
            }
          />
        </div>
        <p className="text-muted text-sm" role="status">
          {TEXTO_ESTADO[estado]}
        </p>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={BOTAO_SECUNDARIO} onClick={baixarJson}>
          Exportar perfil (JSON)
        </button>
        <button
          type="button"
          className={BOTAO_SECUNDARIO}
          onClick={() => arquivoRef.current?.click()}
        >
          Importar perfil (JSON)
        </button>
        <input
          ref={arquivoRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Arquivo de perfil JSON"
          onChange={aoEscolherArquivo}
        />
      </div>
      {mensagem && (
        <p className="mt-3 text-sm" role="status">
          {mensagem}
        </p>
      )}
    </main>
  );
}
