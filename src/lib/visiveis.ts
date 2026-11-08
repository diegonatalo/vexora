import type { Perfil } from "@/lib/schema";

/** Itens sem a marca "Exibir no CV" desligada. `undefined` conta como exibido. */
export const estaVisivel = (item: { exibir?: boolean }) =>
  item.exibir !== false;

/** Cópia do perfil só com o que vai para o CV. O original não é alterado. */
export function somenteVisiveis(perfil: Perfil): Perfil {
  return {
    ...perfil,
    experiencias: perfil.experiencias.filter(estaVisivel),
    formacoes: perfil.formacoes.filter(estaVisivel),
    certificacoes: perfil.certificacoes.filter(estaVisivel),
    idiomas: perfil.idiomas.filter(estaVisivel),
  };
}
