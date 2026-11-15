import type { ReactNode } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { createEmptyProfile, type Profile } from "@/lib/schema";

/** Valores atuais do formulário em JSON, para os testes conferirem. */
const Values = () => {
  const values = useWatch<Profile>();
  return <output data-testid="values">{JSON.stringify(values)}</output>;
};

/** Formulário do perfil para testar seções e campos isolados (só usado em testes). */
export const TestForm = ({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: Partial<Profile>;
}) => {
  const form = useForm<Profile>({ defaultValues: { ...createEmptyProfile(), ...initial } });
  return (
    <FormProvider {...form}>
      {children}
      <Values />
    </FormProvider>
  );
};

export const readValues = (output: HTMLElement): Profile => JSON.parse(output.textContent ?? "{}");
