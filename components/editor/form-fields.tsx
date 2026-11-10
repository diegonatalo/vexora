"use client";

import { useState, type ReactNode } from "react";
import { Controller, useFormContext, type FieldPath } from "react-hook-form";
import { TextField } from "@/components/ui/fields";
import { Icon, type IconName } from "@/components/ui/icons";
import { BUTTON } from "@/components/ui/styles";
import { maskMonthYear } from "@/lib/mask";
import type { Profile } from "@/lib/schema";

/** Campo de data MM/AAAA com máscara, ligado ao formulário do perfil. */
export const MonthYearField = ({
  name,
  label,
  disabled,
}: {
  name: FieldPath<Profile>;
  label: string;
  disabled?: boolean;
}) => {
  const { control } = useFormContext<Profile>();
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
          onChange={(e) => field.onChange(maskMonthYear(e.target.value))}
          error={fieldState.error?.message}
        />
      )}
    />
  );
};

/** Lista separada por vírgulas (itens de um grupo de habilidades) <-> array. */
export const ListField = ({
  name,
  label,
  hint,
}: {
  name: `skills.${number}.items`;
  label: string;
  hint?: string;
}) => {
  const { control } = useFormContext<Profile>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ListFieldInner
          label={label}
          hint={hint}
          initial={field.value}
          onChange={field.onChange}
        />
      )}
    />
  );
};

// Mantém o texto digitado localmente: dividir por vírgula a cada tecla
// engoliria a vírgula e o espaço que a pessoa acabou de digitar.
const ListFieldInner = ({
  label,
  hint,
  initial,
  onChange,
}: {
  label: string;
  hint?: string;
  initial: string[];
  onChange: (v: string[]) => void;
}) => {
  const [text, setText] = useState(initial.join(", "));
  return (
    <TextField
      label={label}
      hint={hint}
      value={text}
      autoComplete="off"
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
      }}
    />
  );
};

export const SectionHeader = ({
  title,
  description,
  icon,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
}) => {
  return (
    <header className="animar-entrada mb-8 flex items-start gap-4">
      {icon && (
        <span className="bg-accent-soft text-accent-deep grid size-12 shrink-0 place-items-center rounded-2xl">
          <Icon name={icon} size={24} />
        </span>
      )}
      <div className="min-w-0">
        <h1
          id="secao-titulo"
          tabIndex={-1}
          className="font-display text-3xl font-bold tracking-tight outline-none"
        >
          {title}
        </h1>
        {description && (
          <p className="text-muted mt-1.5 max-w-prose">{description}</p>
        )}
      </div>
    </header>
  );
};

export const CardItem = ({
  title,
  aside,
  onRemove,
  rotuloRemover,
  handle,
  visible,
  onCollapse,
  rotuloRecolher,
  children,
}: {
  title: string;
  aside?: ReactNode;
  onRemove?: () => void;
  rotuloRemover: string;
  /** Alça de arrastar (ver Ordenavel.tsx). */
  handle?: ReactNode;
  /** Interruptor "Exibir no CV" (ver InterruptorExibir). */
  visible?: ReactNode;
  /** Mostra o botão "Recolher" (card que pode ser recolhido). */
  onCollapse?: () => void;
  rotuloRecolher?: string;
  children: ReactNode;
}) => {
  const number = title.match(/\d+$/)?.[0];
  return (
    <fieldset className="border-line bg-sunken/60 rounded-2xl border p-4 sm:p-5">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          {handle}
          <h3
            className="font-display flex items-center gap-2.5 text-lg font-semibold"
            aria-hidden="true"
          >
            {number && (
              <span className="bg-accent text-on-accent grid size-7 place-items-center rounded-full text-sm">
                {number}
              </span>
            )}
            {title.replace(/\s*\d+$/, "")}
          </h3>
          {aside && (
            <span className="bg-accent-soft text-accent-deep hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline">
              {aside}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {visible}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-expanded={true}
              aria-label={rotuloRecolher}
              title="Recolher"
              className={BUTTON.icon}
            >
              <Icon name="chevron-up" size={18} />
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={rotuloRemover}
              title="Remover"
              className={`${BUTTON.icon} hover:border-warn-icon hover:bg-warn-bg hover:text-warn-ink`}
            >
              <Icon name="trash" size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
};

export const AddItem = ({
  addText,
  onAdd,
}: {
  addText: string;
  onAdd: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="border-line text-muted hover:border-accent hover:bg-accent-soft hover:text-accent-deep flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed font-medium transition duration-150"
    >
      <Icon name="plus" size={18} />
      {addText}
    </button>
  );
};

/**
 * "Exibir no CV": liga e desliga um item sem apagá-lo. Item sem a marca
 * (dados antigos) conta como exibido. Visualmente é um interruptor.
 */
export const VisibilityToggle = ({
  name,
  label,
}: {
  name: FieldPath<Profile>;
  /** Nome acessível único, ex.: "Exibir certificação 2 no CV". */
  label: string;
}) => {
  const { control } = useFormContext<Profile>();
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
              aria-label={label}
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
};
