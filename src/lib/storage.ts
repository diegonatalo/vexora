import { del, get, set } from "idb-keyval";
import {
  backupSchema,
  criarPerfilVazio,
  perfilSchema,
  type Backup,
  type Perfil,
} from "@/lib/schema";
import { sanitizar } from "@/lib/sanitizar";

const CHAVE_PERFIL = "folha:perfil";
// Chave de uma versão antiga do app (que guardava "versões" do CV): só é apagada.
const CHAVE_LEGADA_VERSOES = "folha:versoes";

export type Dados = { perfil: Perfil };

/**
 * Carrega os dados salvos. Rascunhos com campos inválidos são recuperados
 * (campos inválidos esvaziados); dado ausente ou sem conserto (schema mudou,
 * edição manual) cai para um perfil vazio em vez de quebrar a aplicação.
 */
export async function carregarDados(): Promise<Dados> {
  const perfil =
    sanitizar(perfilSchema, await get(CHAVE_PERFIL)) ?? criarPerfilVazio();

  return { perfil };
}

export async function salvarDados(dados: Dados): Promise<void> {
  await set(CHAVE_PERFIL, dados.perfil);
}

export async function apagarDados(): Promise<void> {
  await del(CHAVE_PERFIL);
  await del(CHAVE_LEGADA_VERSOES);
}

export function exportarJson(dados: Dados, agora = new Date()): string {
  const backup: Backup = {
    formato: 1,
    exportadoEm: agora.toISOString(),
    perfil: dados.perfil,
  };
  return JSON.stringify(backup, null, 2);
}

export type ResultadoImportacao =
  { ok: true; dados: Dados } | { ok: false; erro: string };

export function importarJson(texto: string): ResultadoImportacao {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, erro: "O arquivo não é um JSON válido." };
  }
  const resultado = backupSchema.safeParse(bruto);
  if (!resultado.success) {
    return {
      ok: false,
      erro: "O arquivo não parece ser um backup da Vexora ou está incompleto.",
    };
  }
  const { perfil } = resultado.data;
  return {
    ok: true,
    dados: { perfil },
  };
}
