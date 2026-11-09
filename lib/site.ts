/**
 * Endereço público do site, usado em sitemap, robots e Open Graph.
 * Defina NEXT_PUBLIC_SITE_URL para um domínio próprio; em desenvolvimento usa
 * localhost; no resto, https://vexoradn.vercel.app.
 */
const DEFAULT_ADDRESS = "https://vexoradn.vercel.app";

function resolveUrl(): string {
  const defined = process.env.NEXT_PUBLIC_SITE_URL;
  if (defined) return defined.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return DEFAULT_ADDRESS;
}

export const SITE_URL = resolveUrl();
export const SITE_NAME = "Vexora";
export const SITE_DESCRIPTION =
  "Cadastre seu perfil uma vez e baixe um CV de 1 página otimizado para ATS. Seus dados ficam só no seu navegador.";
