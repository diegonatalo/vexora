import { del, get, set } from "idb-keyval";
import {
  backupSchema,
  createEmptyProfile,
  profileSchema,
  type Backup,
  type Profile,
} from "@/lib/schema";
import { sanitize } from "@/lib/sanitize";

const PROFILE_KEY = "vexora:profile:v1";

export type AppData = { profile: Profile };

/**
 * Carrega os dados salvos. Rascunhos com campos inválidos são recuperados
 * (campos inválidos esvaziados); dado ausente ou sem conserto (schema mudou,
 * edição manual) cai para um perfil vazio em vez de quebrar a aplicação.
 */
export async function loadData(): Promise<AppData> {
  const profile =
    sanitize(profileSchema, await get(PROFILE_KEY)) ??
    createEmptyProfile();

  return { profile };
}

export async function saveData(data: AppData): Promise<void> {
  await set(PROFILE_KEY, data.profile);
}

export async function deleteData(): Promise<void> {
  await del(PROFILE_KEY);
}

export function exportJson(data: AppData, now = new Date()): string {
  const backup: Backup = {
    format: 1,
    exportedAt: now.toISOString(),
    profile: data.profile,
  };
  return JSON.stringify(backup, null, 2);
}

export type ImportResult =
  { ok: true; data: AppData } | { ok: false; error: string };

export function importJson(text: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: "O arquivo não é um JSON válido." };
  }
  const result = backupSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      error: "O arquivo não parece ser um backup da Vexora ou está incompleto.",
    };
  }
  const { profile } = result.data;
  return {
    ok: true,
    data: { profile },
  };
}
