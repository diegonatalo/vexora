"use client";

import { useState, type ReactNode } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import { TextField } from "@/components/ui/fields";
import { Icon, type IconName } from "@/components/ui/icons";
import { BOTAO } from "@/components/ui/estilos";
import { mascaraMesAno } from "@/lib/mascara";
import type { Perfil } from "@/lib/schema";

/** Campo de data MM/AAAA com máscara, ligado ao formulário do perfil. */
export function CampoMesAno({
  name,
  label,
  disabled,
}: {
  name: FieldPath<Perfil>;
  label: string;
  disabled?: boolean;
}) {
  const { control } = useFormContext<Perfil>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          placeholder="MM/AAAA"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          disabled={disabled}
          name={field.name}
          ref={field.ref}
          value={(field.value as string) ?? ""}
          onBlur={field.onBlur}
          onChange={(e) => field.onChange(mascaraMesAno(e.target.value))}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

/** Lista separada por vírgulas (habilidades) <-> array de strings. */
export function CampoLista({
  name,
  label,
  hint,
}: {
  name:
    | "habilidades.linguagens"
    | "habilidades.frameworks"
    | "habilidades.ferramentas";
  label: string;
  hint?: string;
}) {
  const { control } = useFormContext<Perfil>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CampoListaInterno
          label={label}
          hint={hint}
          inicial={field.value}
          aoMudar={field.onChange}
        />
      )}
    />
  );
}

// Mantém o texto digitado localmente: dividir por vírgula a cada tecla
// engoliria a vírgula e o espaço que a pessoa acabou de digitar.
function CampoListaInterno({
  label,
  hint,
  inicial,
  aoMudar,
}: {
  label: string;
  hint?: string;
  inicial: string[];
  aoMudar: (v: string[]) => void;
}) {
  const [texto, setTexto] = useState(inicial.join(", "));
  return (
    <TextField
      label={label}
      hint={hint}
      value={texto}
      autoComplete="off"
      onChange={(e) => {
        setTexto(e.target.value);
        aoMudar(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
}

export function SecaoCabecalho({
  titulo,
  descricao,
  icone,
}: {
  titulo: string;
  descricao?: ReactNode;
  icone?: IconName;
}) {
  return (
    <header className="animar-entrada mb-8 flex items-start gap-4">
      {icone && (
        <span className="bg-accent-soft text-accent-deep grid size-12 shrink-0 place-items-center rounded-2xl">
          <Icon name={icone} size={24} />
        </span>
      )}
      <div className="min-w-0">
        <h2
          id="secao-titulo"
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight outline-none"
        >
          {titulo}
        </h2>
        {descricao && (
          <p className="text-muted mt-1.5 max-w-prose">{descricao}</p>
        )}
      </div>
    </header>
  );
}

export function CartaoItem({
  titulo,
  aside,
  onRemover,
  rotuloRemover,
  alca,
  exibir,
  onRecolher,
  rotuloRecolher,
  children,
}: {
  titulo: string;
  aside?: ReactNode;
  onRemover?: () => void;
  rotuloRemover: string;
  /** Alça de arrastar (ver Ordenavel.tsx). */
  alca?: ReactNode;
  /** Interruptor "Exibir no CV" (ver InterruptorExibir). */
  exibir?: ReactNode;
  /** Mostra o botão "Recolher" (card que pode ser recolhido). */
  onRecolher?: () => void;
  rotuloRecolher?: string;
  children: ReactNode;
}) {
  const numero = titulo.match(/\d+$/)?.[0];
  return (
    <fieldset className="border-line bg-sunken/60 rounded-2xl border p-4 sm:p-5">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          {alca}
          <h3
            className="font-display flex items-center gap-2.5 text-lg font-semibold"
            aria-hidden="true"
          >
            {numero && (
              <span className="bg-accent text-on-accent grid size-7 place-items-center rounded-full text-sm">
                {numero}
              </span>
            )}
            {titulo.replace(/\s*\d+$/, "")}
          </h3>
          {aside && (
            <span className="bg-accent-soft text-accent-deep hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline">
              {aside}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {exibir}
          {onRecolher && (
            <button
              type="button"
              onClick={onRecolher}
              aria-expanded={true}
              aria-label={rotuloRecolher}
              title="Recolher"
              className={BOTAO.icone}
            >
              <Icon name="chevron-up" size={18} />
            </button>
          )}
          {onRemover && (
            <button
              type="button"
              onClick={onRemover}
              aria-label={rotuloRemover}
              title="Remover"
              className={`${BOTAO.icone} hover:border-warn-icon hover:bg-warn-bg hover:text-warn-ink`}
            >
              <Icon name="trash" size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

export function AdicionarItem({
  textoAdicionar,
  onAdicionar,
}: {
  textoAdicionar: string;
  onAdicionar: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdicionar}
      className="border-line text-muted hover:border-accent hover:bg-accent-soft hover:text-accent-deep flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed font-medium transition duration-150"
    >
      <Icon name="plus" size={18} />
      {textoAdicionar}
    </button>
  );
}

/**
 * "Exibir no CV": liga e desliga um item sem apagá-lo. Item sem a marca
 * (dados antigos) conta como exibido. Visualmente é um interruptor.
 */
export function InterruptorExibir({
  name,
  rotulo,
}: {
  name: FieldPath<Perfil>;
  /** Nome acessível único, ex.: "Exibir certificação 2 no CV". */
  rotulo: string;
}) {
  const { control } = useFormContext<Perfil>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="text-muted inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-medium select-none">
          <span className="relative inline-flex h-6 w-11 shrink-0">
            <input
              type="checkbox"
              className="peer sr-only"
              aria-label={rotulo}
              checked={field.value !== false}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
            <span className="bg-stage border-field peer-checked:bg-accent peer-checked:border-accent peer-focus-visible:outline-accent absolute inset-0 rounded-full border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2" />
            <span className="absolute top-1 left-1 size-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
          <span aria-hidden="true" className="hidden sm:inline">
            Exibir no CV
          </span>
        </label>
      )}
    />
  );
}
