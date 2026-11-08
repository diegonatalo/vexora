/** Formata a digitação como MM/AAAA: "032022" -> "03/2022". */
export function mascaraMesAno(entrada: string): string {
  const digitos = entrada.replace(/\D/g, "").slice(0, 6);
  return digitos.length <= 2
    ? digitos
    : `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}
