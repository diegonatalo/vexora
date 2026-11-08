"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

const BASE_CAMPO =
  "w-full rounded-field border bg-surface px-3 text-ink placeholder:text-muted disabled:bg-paper disabled:text-muted";

type FieldBaseProps = {
  label: string;
  /** Mensagem de erro de validação (texto + ícone, nunca só cor). */
  error?: string;
  hint?: ReactNode;
  /** Texto à direita do label (ex.: contador de caracteres). */
  aside?: ReactNode;
};

type CampoProps = FieldBaseProps & {
  render: (aria: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
};

/** Casca com label, dica e erro ligados ao controle por id/aria-describedby. */
function Campo({ label, error, hint, aside, render }: CampoProps) {
  const uid = useId();
  const id = `${uid}-campo`;
  const erroId = `${uid}-erro`;
  const dicaId = `${uid}-dica`;
  const describedBy =
    [error ? erroId : null, hint ? dicaId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {aside && <span className="text-muted text-sm">{aside}</span>}
      </div>
      {render({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: `${BASE_CAMPO} ${error ? "border-warn-icon" : "border-field"}`,
      })}
      {hint && (
        <p id={dicaId} className="text-muted mt-1 text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={erroId}
          className="text-warn-ink mt-1 flex items-start gap-1.5 text-sm"
        >
          <Icon
            name="alert"
            size={16}
            className="text-warn-icon mt-0.5 shrink-0"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  error,
  hint,
  aside,
  ...input
}: FieldBaseProps & Omit<ComponentProps<"input">, "id" | "className">) {
  return (
    <Campo
      label={label}
      error={error}
      hint={hint}
      aside={aside}
      render={(aria) => (
        <input {...input} {...aria} className={`${aria.className} min-h-11`} />
      )}
    />
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  aside,
  rows = 3,
  ...area
}: FieldBaseProps & Omit<ComponentProps<"textarea">, "id" | "className">) {
  return (
    <Campo
      label={label}
      error={error}
      hint={hint}
      aside={aside}
      render={(aria) => (
        <textarea
          {...area}
          {...aria}
          rows={rows}
          className={`${aria.className} resize-y py-2`}
        />
      )}
    />
  );
}

export function CheckboxField({
  label,
  ...input
}: { label: string } & Omit<ComponentProps<"input">, "id" | "type">) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center gap-3">
      <input
        {...input}
        id={id}
        type="checkbox"
        className="accent-accent size-5 shrink-0"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
