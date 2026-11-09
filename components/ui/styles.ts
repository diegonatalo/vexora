const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-field px-4 font-medium transition duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0";

export const BUTTON = {
  /** Ação principal (uma por tela). */
  primary: `${BASE} bg-accent text-on-accent shadow-sm hover:bg-accent-strong hover:shadow-md`,
  escuro: `${BASE} bg-ink text-paper hover:opacity-90`,
  secondary: `${BASE} border border-line bg-surface text-ink shadow-sm hover:border-field hover:bg-sunken`,
  /** Sem borda: ações discretas dentro de cards. */
  ghost: `${BASE} text-muted hover:bg-accent-soft hover:text-accent-deep`,
  /** Quadrado, só ícone (use com aria-label). */
  icon: `inline-flex size-11 shrink-0 items-center justify-center rounded-field border border-line bg-surface text-muted shadow-sm transition duration-150 hover:border-field hover:text-ink active:translate-y-px`,
} as const;

export const CARD = "rounded-card border border-line bg-surface shadow-card";

/** Rótulo pequeno em caixa-alta (títulos de grupos). */
export const KICKER =
  "text-xs font-semibold tracking-[0.14em] text-muted uppercase";
