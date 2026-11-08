"use client";

import { useState, type ReactNode } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import { TextField } from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
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
}: {
  titulo: string;
  descricao?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <h2
        id="secao-titulo"
        tabIndex={-1}
        className="font-display text-3xl font-bold outline-none"
      >
        {titulo}
      </h2>
      {descricao && <p className="text-muted mt-2">{descricao}</p>}
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
  children,
}: {
  titulo: string;
  aside?: ReactNode;
  /** Alça de arrastar (ver Ordenavel.tsx). */
  alca?: ReactNode;
  /** Interruptor "Exibir no CV" (ver InterruptorExibir). */
  exibir?: ReactNode;
  onRemover?: () => void;
  rotuloRemover: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-field rounded-card border p-5">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold" aria-hidden="true">
          {titulo}
        </h3>
        <div className="flex items-center gap-3">
          {exibir}
          {alca}
          {aside && <span className="text-muted text-sm">{aside}</span>}
          {onRemover && (
            <button
              type="button"
              onClick={onRemover}
              className={`${BOTAO.secundario} px-3`}
              aria-label={rotuloRemover}
            >
              <Icon name="trash" size={18} />
              <span className="hidden sm:inline">Remover</span>
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
    <button type="button" onClick={onAdicionar} className={BOTAO.secundario}>
      <Icon name="plus" size={18} />
      {textoAdicionar}
    </button>
  );
}

/**
 * "Exibir no CV": liga e desliga um item sem apagá-lo. Item sem a marca
 * (dados antigos) conta como exibido.
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
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-accent size-5 shrink-0"
            aria-label={rotulo}
            checked={field.value !== false}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            ref={field.ref}
          />
          <span aria-hidden="true">Exibir no CV</span>
        </label>
      )}
    />
  );
}
