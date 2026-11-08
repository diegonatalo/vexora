/**
 * Endereço público do site, usado em sitemap, robots e Open Graph.
 * Defina NEXT_PUBLIC_SITE_URL para um domínio próprio; em desenvolvimento usa
 * localhost; no resto, https://vexoradn.vercel.app.
 */
const ENDERECO_PADRAO = "https://vexoradn.vercel.app";

function resolverUrl(): string {
  const definido = process.env.NEXT_PUBLIC_SITE_URL;
  if (definido) return definido.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return ENDERECO_PADRAO;
}

export const SITE_URL = resolverUrl();
export const SITE_NOME = "Vexora";
export const SITE_DESCRICAO =
  "Cadastre seu perfil uma vez e baixe um CV de 1 página otimizado para ATS. Adapte o currículo à vaga. Seus dados ficam só no seu navegador.";
