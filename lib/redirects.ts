import type { NextConfig } from "next";

export type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/**
 * Redirecionamentos do projeto, lidos pelo `next.config.ts` (que é igual em todos os projetos).
 * O editor morava em `/editor` antes da landing; links antigos continuam funcionando.
 */
export const REDIRECTS: Redirect[] = [{ source: "/editor", destination: "/app", permanent: true }];
