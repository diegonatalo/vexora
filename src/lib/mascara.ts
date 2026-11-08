/** Formata a digitação como MM/AAAA: "032022" -> "03/2022". */
export function mascaraMesAno(entrada: string): string {
  const digitos = entrada.replace(/\D/g, "").slice(0, 6);
  return digitos.length <= 2
    ? digitos
    : `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

/** Formata a digitação como telefone: "11987654321" -> "(11) 98765-4321". */
export function mascaraTelefone(entrada: string): string {
  const d = entrada.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const meio = d.length <= 10 ? 6 : 7;
  const inicio = `(${d.slice(0, 2)}) ${d.slice(2, meio)}`;
  return d.length <= meio ? inicio : `${inicio}-${d.slice(meio)}`;
}

const TEM_ESQUEMA = /^https?:\/\//i;

/** Parece um endereço (e não só o usuário)? Tem esquema, ponto ou barra. */
function pareceEndereco(texto: string): boolean {
  return TEM_ESQUEMA.test(texto) || /[./]/.test(texto);
}

function comHttps(texto: string): string {
  return TEM_ESQUEMA.test(texto) ? texto : `https://${texto}`;
}

/**
 * Perfil de rede social: aceita só o usuário ("ana-souza" ou "@ana-souza") e
 * monta o endereço; se já veio um endereço, só garante o https://.
 */
export function normalizarPerfilSocial(entrada: string, base: string): string {
  const texto = entrada.trim();
  if (texto === "") return "";
  if (pareceEndereco(texto)) return comHttps(texto.replace(/^\/+/, ""));
  return `${base}${texto.replace(/^@/, "")}`;
}

/** Site pessoal: só garante o https:// no começo. */
export function normalizarSite(entrada: string): string {
  const texto = entrada.trim();
  return texto === "" ? "" : comHttps(texto);
}

export const BASE_LINKEDIN = "https://linkedin.com/in/";
export const BASE_GITHUB = "https://github.com/";
