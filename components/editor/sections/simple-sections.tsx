"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { SectionHeader } from "@/components/editor/form-fields";
import {
  BASE_GITHUB,
  BASE_LINKEDIN,
  maskPhone,
  normalizeSocialProfile,
  normalizeSite,
} from "@/lib/mask";
import type { Profile } from "@/lib/schema";

export const PersonalDataSection = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  return (
    <>
      <SectionHeader
        title="Dados pessoais"
        icon="user"
        description="Aparecem no topo do CV. E-mail e telefone são obrigatórios para o ATS."
      />
      <div className="space-y-4">
        <TextField
          label="Nome completo"
          autoComplete="name"
          placeholder="[Seu Nome Completo]"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <TextField
          label="Cargo desejado"
          placeholder="[Cargo desejado]"
          error={errors.desiredJobTitle?.message}
          {...register("desiredJobTitle")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Cidade e UF"
            autoComplete="address-level2"
            placeholder="[Cidade, UF]"
            error={errors.cityState?.message}
            {...register("cityState")}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextField
                label="Telefone"
                type="tel"
                autoComplete="tel"
                placeholder="[(00) 00000-0000]"
                maxLength={15}
                error={errors.phone?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) =>
                  field.onChange(maskPhone(e.target.value))
                }
              />
            )}
          />
        </div>
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="[email@dominio.com]"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>
    </>
  );
};

export const SummarySection = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  const summary = useWatch({ control, name: "summary" });
  return (
    <>
      <SectionHeader
        title="Resumo"
        icon="file-text"
        description="De 2 a 3 linhas: quem você é, sua área, anos de experiência ou formação e as tecnologias que mais importam para a vaga."
      />
      <TextAreaField
        label="Resumo profissional"
        rows={5}
        aside={`${summary.length}/500`}
        placeholder="[2 a 3 linhas: quem você é, sua área e o que mais importa para a vaga.]"
        error={errors.summary?.message}
        {...register("summary")}
      />
    </>
  );
};

type LinkFieldProps = {
  name: "links.linkedin" | "links.github" | "links.portfolio";
  label: string;
  placeholder: string;
  hint?: string;
  normalize: (text: string) => string;
};

/** Normaliza ao sair do campo, para não mexer no texto enquanto a pessoa digita. */
const LinkField = ({
  name,
  label,
  placeholder,
  hint,
  normalize,
}: LinkFieldProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  const key = name.split(".")[1] as keyof Profile["links"];
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField
          label={label}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          hint={hint}
          error={errors.links?.[key]?.message}
          name={field.name}
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          onBlur={() => {
            field.onChange(normalize(field.value));
            field.onBlur();
          }}
        />
      )}
    />
  );
};

export const LinksSection = () => {
  return (
    <>
      <SectionHeader
        title="Links e portfólio"
        icon="link"
        description="O LinkedIn é recomendado: muitos recrutadores o conferem. GitHub e portfólio são opcionais."
      />
      <div className="space-y-4">
        <LinkField
          name="links.linkedin"
          label="LinkedIn"
          placeholder="seu-usuario"
          hint="Digite só o usuário (o que vem depois de linkedin.com/in/) ou cole o endereço."
          normalize={(t) => normalizeSocialProfile(t, BASE_LINKEDIN)}
        />
        <LinkField
          name="links.github"
          label="GitHub"
          placeholder="seu-usuario"
          hint="Digite só o usuário ou cole o endereço."
          normalize={(t) => normalizeSocialProfile(t, BASE_GITHUB)}
        />
        <LinkField
          name="links.portfolio"
          label="Portfólio"
          placeholder="seusite.dev"
          hint="O https:// é adicionado automaticamente."
          normalize={normalizeSite}
        />
      </div>
    </>
  );
};
