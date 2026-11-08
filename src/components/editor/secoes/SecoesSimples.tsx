"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { SecaoCabecalho } from "@/components/editor/campos";
import type { Perfil } from "@/lib/schema";

const URL_DICA = "Cole o endereço completo, começando com https://";

export function DadosPessoaisSecao() {
  const {
    register,
    formState: { errors },
  } = useFormContext<Perfil>();
  return (
    <>
      <SecaoCabecalho
        titulo="Dados pessoais"
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
          <TextField
            label="Telefone"
            type="tel"
            autoComplete="tel"
            placeholder="[(00) 00000-0000]"
            error={errors.telefone?.message}
            {...register("telefone")}
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

export function LinksSecao() {
  const {
    register,
    formState: { errors },
  } = useFormContext<Perfil>();
  return (
    <>
      <SecaoCabecalho
        titulo="Links e portfólio"
        descricao="O LinkedIn é recomendado: muitos recrutadores o conferem. GitHub e portfólio são opcionais."
      />
      <div className="space-y-4">
        <TextField
          label="LinkedIn"
          type="url"
          inputMode="url"
          placeholder="https://linkedin.com/in/usuario"
          hint={URL_DICA}
          error={errors.links?.linkedin?.message}
          {...register("links.linkedin")}
        />
        <TextField
          label="GitHub"
          type="url"
          inputMode="url"
          placeholder="https://github.com/usuario"
          error={errors.links?.github?.message}
          {...register("links.github")}
        />
        <TextField
          label="Portfólio"
          type="url"
          inputMode="url"
          placeholder="https://seusite.dev"
          error={errors.links?.portfolio?.message}
          {...register("links.portfolio")}
        />
      </div>
    </>
  );
}
