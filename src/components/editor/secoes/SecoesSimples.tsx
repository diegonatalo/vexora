"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { SecaoCabecalho } from "@/components/editor/campos";
import {
  BASE_GITHUB,
  BASE_LINKEDIN,
  mascaraTelefone,
  normalizarPerfilSocial,
  normalizarSite,
} from "@/lib/mascara";
import type { Perfil } from "@/lib/schema";

export function DadosPessoaisSecao() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  return (
    <>
      <SecaoCabecalho
        titulo="Dados pessoais"
        icone="user"
        descricao="Aparecem no topo do CV. E-mail e telefone são obrigatórios para o ATS."
      />
      <div className="space-y-4">
        <TextField
          label="Nome completo"
          autoComplete="name"
          placeholder="[Seu Nome Completo]"
          error={errors.nomeCompleto?.message}
          {...register("nomeCompleto")}
        />
        <TextField
          label="Cargo desejado"
          placeholder="[Cargo desejado]"
          error={errors.cargoDesejado?.message}
          {...register("cargoDesejado")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Cidade e UF"
            autoComplete="address-level2"
            placeholder="[Cidade, UF]"
            error={errors.cidadeUf?.message}
            {...register("cidadeUf")}
          />
          <Controller
            control={control}
            name="telefone"
            render={({ field }) => (
              <TextField
                label="Telefone"
                type="tel"
                autoComplete="tel"
                placeholder="[(00) 00000-0000]"
                maxLength={15}
                error={errors.telefone?.message}
                name={field.name}
                ref={field.ref}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) =>
                  field.onChange(mascaraTelefone(e.target.value))
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
}

export function ResumoSecao() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  const resumo = useWatch({ control, name: "resumo" });
  return (
    <>
      <SecaoCabecalho
        titulo="Resumo"
        icone="file-text"
        descricao="De 2 a 3 linhas: quem você é, sua área, anos de experiência ou formação e as tecnologias que mais importam para a vaga."
      />
      <TextAreaField
        label="Resumo profissional"
        rows={5}
        aside={`${resumo.length}/500`}
        placeholder="[2 a 3 linhas: quem você é, sua área e o que mais importa para a vaga.]"
        error={errors.resumo?.message}
        {...register("resumo")}
      />
    </>
  );
}

type CampoLinkProps = {
  name: "links.linkedin" | "links.github" | "links.portfolio";
  label: string;
  placeholder: string;
  hint?: string;
  normalizar: (texto: string) => string;
};

/** Normaliza ao sair do campo, para não mexer no texto enquanto a pessoa digita. */
function CampoLink({
  name,
  label,
  placeholder,
  hint,
  normalizar,
}: CampoLinkProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  const chave = name.split(".")[1] as keyof Perfil["links"];
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
          error={errors.links?.[chave]?.message}
          name={field.name}
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          onBlur={() => {
            field.onChange(normalizar(field.value));
            field.onBlur();
          }}
        />
      )}
    />
  );
}

export function LinksSecao() {
  return (
    <>
      <SecaoCabecalho
        titulo="Links e portfólio"
        icone="link"
        descricao="O LinkedIn é recomendado: muitos recrutadores o conferem. GitHub e portfólio são opcionais."
      />
      <div className="space-y-4">
        <CampoLink
          name="links.linkedin"
          label="LinkedIn"
          placeholder="seu-usuario"
          hint="Digite só o usuário (o que vem depois de linkedin.com/in/) ou cole o endereço."
          normalizar={(t) => normalizarPerfilSocial(t, BASE_LINKEDIN)}
        />
        <CampoLink
          name="links.github"
          label="GitHub"
          placeholder="seu-usuario"
          hint="Digite só o usuário ou cole o endereço."
          normalizar={(t) => normalizarPerfilSocial(t, BASE_GITHUB)}
        />
        <CampoLink
          name="links.portfolio"
          label="Portfólio"
          placeholder="seusite.dev"
          hint="O https:// é adicionado automaticamente."
          normalizar={normalizarSite}
        />
      </div>
    </>
  );
}
