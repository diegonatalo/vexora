/**
 * Endereço público do site, usado em sitemap, robots e Open Graph.
 * Defina NEXT_PUBLIC_SITE_URL para um domínio próprio; na Vercel, cai para o
 * domínio de produção do projeto; localmente, para localhost.
 */
function resolverUrl(): string {
  const definido = process.env.NEXT_PUBLIC_SITE_URL;
  if (definido) return definido.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolverUrl();
export const SITE_NOME = "Vexora";
export const SITE_DESCRICAO =
  "Cadastre seu perfil uma vez e baixe um CV de 1 página otimizado para ATS. Adapte o currículo à vaga. Seus dados ficam só no seu navegador.";
