/** Formata a digitação como MM/AAAA: "032022" -> "03/2022". */
export function maskMonthYear(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 6);
  return digits.length <= 2
    ? digits
    : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Formata a digitação como telefone: "11987654321" -> "(11) 98765-4321". */
export function maskPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const middle = d.length <= 10 ? 6 : 7;
  const start = `(${d.slice(0, 2)}) ${d.slice(2, middle)}`;
  return d.length <= middle ? start : `${start}-${d.slice(middle)}`;
}

const HAS_SCHEMA = /^https?:\/\//i;

/** Parece um endereço (e não só o usuário)? Tem esquema, ponto ou barra. */
function looksLikeAddress(text: string): boolean {
  return HAS_SCHEMA.test(text) || /[./]/.test(text);
}

function withHttps(text: string): string {
  return HAS_SCHEMA.test(text) ? text : `https://${text}`;
}

/**
 * Perfil de rede social: aceita só o usuário ("ana-souza" ou "@ana-souza") e
 * monta o endereço; se já veio um endereço, só garante o https://.
 */
export function normalizeSocialProfile(input: string, base: string): string {
  const text = input.trim();
  if (text === "") return "";
  if (looksLikeAddress(text)) return withHttps(text.replace(/^\/+/, ""));
  return `${base}${text.replace(/^@/, "")}`;
}

/** Site pessoal: só garante o https:// no começo. */
export function normalizeSite(input: string): string {
  const text = input.trim();
  return text === "" ? "" : withHttps(text);
}

export const BASE_LINKEDIN = "https://linkedin.com/in/";
export const BASE_GITHUB = "https://github.com/";
