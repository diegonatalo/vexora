const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-field px-4 font-medium disabled:cursor-not-allowed disabled:opacity-60";

export const BOTAO = {
  primario: `${BASE} bg-accent text-on-accent`,
  escuro: `${BASE} bg-ink text-paper`,
  secundario: `${BASE} border border-field bg-surface text-ink`,
} as const;

export const CARTAO = "rounded-card border border-line bg-surface";
