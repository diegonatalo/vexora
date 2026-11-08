"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  AdicionarOuLimite,
  CampoMesAno,
  CartaoItem,
  SecaoCabecalho,
} from "@/components/editor/campos";
import {
  CheckboxField,
  TextAreaField,
  TextField,
} from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { criarExperienciaVazia, LIMITES, type Perfil } from "@/lib/schema";

const LIMITE = LIMITES.caracteresPorTopico;

export function ExperienciaSecao() {
  const {
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experiencias",
  });
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <>
      <SecaoCabecalho
        titulo="Experiência"
        descricao={`Até ${LIMITES.experiencias} experiências com ${LIMITES.topicosPorExperiencia} tópicos cada. É o que garante 1 página sem reduzir a fonte.`}
      />
      <div className="space-y-4">
        {fields.map((campo, i) => {
          const erro = errors.experiencias?.[i];
          if (i === aberta) {
            return (
              <CartaoItem
                key={campo.id}
                titulo={`Experiência ${i + 1}`}
                aside="Mais recente primeiro"
                rotuloRemover={`Remover experiência ${i + 1}`}
                onRemover={() => {
                  remove(i);
                  setAberta(null);
                }}
              >
                <ExperienciaCampos indice={i} />
              </CartaoItem>
            );
          }
          const temErroData = Boolean(erro?.inicio || erro?.fim);
          const temErro = Boolean(erro);
          return (
            <ExperienciaRecolhida
              key={campo.id}
              indice={i}
              aviso={
                temErroData
                  ? "Data fora do padrão"
                  : temErro
                    ? "Revise os campos"
                    : undefined
              }
              onAbrir={() => setAberta(i)}
            />
          );
        })}
        <AdicionarOuLimite
          atingiuLimite={fields.length >= LIMITES.experiencias}
          textoLimite={`Limite de ${LIMITES.experiencias} experiências para manter 1 página`}
          textoAdicionar="Adicionar experiência"
          onAdicionar={() => {
            append(criarExperienciaVazia());
            setAberta(fields.length);
          }}
        />
      </div>
    </>
  );
}

function ExperienciaRecolhida({
  indice,
  aviso,
  onAbrir,
}: {
  indice: number;
  aviso?: string;
  onAbrir: () => void;
}) {
  const { control } = useFormContext<Perfil>();
  const [cargo, empresa] = useWatch({
    control,
    name: [`experiencias.${indice}.cargo`, `experiencias.${indice}.empresa`],
  });
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-expanded={false}
      className="border-line bg-paper rounded-card flex min-h-14 w-full items-center justify-between gap-3 border px-5 py-3 text-left"
    >
      <span>
        <span className="font-display font-semibold">
          Experiência {indice + 1}
        </span>
        <span className="text-muted">
          {" "}
          · {cargo || "[Cargo]"} · {empresa || "[Empresa]"}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {aviso && (
          <span className="bg-warn-bg text-warn-ink inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
            <Icon name="alert" size={16} className="text-warn-icon" />
            {aviso}
          </span>
        )}
        <Icon name="chevron-down" />
      </span>
    </button>
  );
}

function ExperienciaCampos({ indice }: { indice: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  const erro = errors.experiencias?.[indice];
  const atual = useWatch({ control, name: `experiencias.${indice}.atual` });
  const topicos = useWatch({ control, name: `experiencias.${indice}.topicos` });
  const base = `experiencias.${indice}` as const;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Cargo"
          placeholder="[Cargo]"
          error={erro?.cargo?.message}
          {...register(`${base}.cargo`)}
        />
        <TextField
          label="Empresa"
          placeholder="[Empresa]"
          error={erro?.empresa?.message}
          {...register(`${base}.empresa`)}
        />
      </div>
      <TextField
        label="Cidade e UF (opcional)"
        placeholder="[Cidade/UF]"
        error={erro?.cidadeUf?.message}
        {...register(`${base}.cidadeUf`)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoMesAno name={`${base}.inicio`} label="Início" />
        <CampoMesAno name={`${base}.fim`} label="Fim" disabled={atual} />
      </div>
      <CheckboxField
        label="Trabalho aqui atualmente"
        {...register(`${base}.atual`)}
      />
      <div>
        <h4 className="mb-2 font-medium">Tópicos</h4>
        <div className="space-y-4">
          {Array.from({ length: LIMITES.topicosPorExperiencia }, (_, j) => {
            const tamanho = topicos?.[j]?.length ?? 0;
            return (
              <TextAreaField
                key={j}
                label={`Tópico ${j + 1} · ${tamanho}/${LIMITE}`}
                rows={2}
                placeholder={
                  j === 2
                    ? "Comece com um verbo de ação: desenvolvi, reduzi, liderei…"
                    : "[Verbo de ação] + [o que você fez] + [resultado ou métrica]"
                }
                error={erro?.topicos?.[j]?.message}
                {...register(`${base}.topicos.${j}`)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
