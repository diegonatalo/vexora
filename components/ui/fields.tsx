"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

const FIELD_BASE =
  "w-full rounded-field border bg-sunken px-4 text-ink shadow-[inset_0_1px_0_rgb(0_0_0/0.02)] transition duration-150 placeholder:text-muted/70 hover:bg-surface focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/15 focus:outline-none disabled:cursor-not-allowed disabled:bg-stage disabled:text-muted";

type FieldBaseProps = {
  label: string;
  /** Mensagem de erro de validação (texto + ícone, nunca só cor). */
  error?: string;
  hint?: ReactNode;
  /** Texto à direita do label (ex.: contador de caracteres). */
  aside?: ReactNode;
};

type FormFieldProps = FieldBaseProps & {
  render: (aria: {
    id: string;
    "aria-invalid": true | undefined;
    "aria-describedby": string | undefined;
    className: string;
  }) => ReactNode;
};

/** Casca com label, dica e erro ligados ao controle por id/aria-describedby. */
const FormField = ({ label, error, hint, aside, render }: FormFieldProps) => {
  const uid = useId();
  const id = `${uid}-campo`;
  const errorId = `${uid}-erro`;
  const hintId = `${uid}-dica`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {aside && <span className="text-muted text-sm">{aside}</span>}
      </div>
      {render({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: `${FIELD_BASE} ${error ? "border-warn-icon ring-4 ring-warn-icon/10" : "border-field"}`,
      })}
      {hint && (
        <p id={hintId} className="text-muted mt-1.5 text-sm">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
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
};

export const TextField = ({
  label,
  error,
  hint,
  aside,
  ...input
}: FieldBaseProps & Omit<ComponentProps<"input">, "id" | "className">) => {
  return (
    <FormField
      label={label}
      error={error}
      hint={hint}
      aside={aside}
      render={(aria) => (
        <input {...input} {...aria} className={`${aria.className} min-h-11`} />
      )}
    />
  );
};

export const TextAreaField = ({
  label,
  error,
  hint,
  aside,
  rows = 3,
  ...area
}: FieldBaseProps & Omit<ComponentProps<"textarea">, "id" | "className">) => {
  return (
    <FormField
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
};

export const CheckboxField = ({
  label,
  ...input
}: { label: string } & Omit<ComponentProps<"input">, "id" | "type">) => {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center gap-3">
      <input
        {...input}
        id={id}
        type="checkbox"
        className="accent-accent size-5 shrink-0 cursor-pointer rounded-md"
      />
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
};
