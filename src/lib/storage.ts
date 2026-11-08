import { del, get, set } from "idb-keyval";
import {
  backupSchema,
  criarPerfilVazio,
  criarVersaoPadrao,
  perfilSchema,
  versaoCvSchema,
  type Backup,
  type Perfil,
  type VersaoCv,
} from "@/lib/schema";
import { z } from "zod";

const CHAVE_PERFIL = "folha:perfil";
const CHAVE_VERSOES = "folha:versoes";

export type Dados = { perfil: Perfil; versoes: VersaoCv[] };

/**
 * Carrega os dados salvos. Dado ausente ou inválido (schema mudou, edição
 * manual) cai para um perfil vazio em vez de quebrar a aplicação.
 */
export async function carregarDados(): Promise<Dados> {
  const perfilSalvo = perfilSchema.safeParse(await get(CHAVE_PERFIL));
  const perfil = perfilSalvo.success ? perfilSalvo.data : criarPerfilVazio();

  const versoesSalvas = z
    .array(versaoCvSchema)
    .safeParse(await get(CHAVE_VERSOES));
  const versoes =
    versoesSalvas.success && versoesSalvas.data.length > 0
      ? versoesSalvas.data
      : [criarVersaoPadrao(perfil)];

  return { perfil, versoes };
}

export async function salvarDados(dados: Dados): Promise<void> {
  await set(CHAVE_PERFIL, dados.perfil);
  await set(CHAVE_VERSOES, dados.versoes);
}

export async function apagarDados(): Promise<void> {
  await del(CHAVE_PERFIL);
  await del(CHAVE_VERSOES);
}

export function exportarJson(dados: Dados, agora = new Date()): string {
  const backup: Backup = {
    formato: 1,
    exportadoEm: agora.toISOString(),
    perfil: dados.perfil,
    versoes: dados.versoes,
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
      erro: "O arquivo não parece ser um backup da Folha ou está incompleto.",
    };
  }
  const { perfil, versoes } = resultado.data;
  return {
    ok: true,
    dados: {
      perfil,
      versoes: versoes.length > 0 ? versoes : [criarVersaoPadrao(perfil)],
    },
  };
}
