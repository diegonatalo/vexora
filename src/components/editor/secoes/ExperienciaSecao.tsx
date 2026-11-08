"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ItemOrdenavel, ListaOrdenavel } from "@/components/editor/Ordenavel";
import {
  AdicionarItem,
  CampoMesAno,
  CartaoItem,
  InterruptorExibir,
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
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experiencias",
  });
  // Guarda o id (não a posição): a experiência aberta acompanha a reordenação.
  const [aberta, setAberta] = useState<string | null>(fields[0]?.id ?? null);

  return (
    <>
      <SecaoCabecalho
        titulo="Experiência"
        descricao={`Até ${LIMITES.topicosPorExperiencia} tópicos por experiência. Use "Exibir no CV" para ocultar uma experiência sem apagá-la.`}
      />
      <div className="space-y-4">
        <ListaOrdenavel
          ids={fields.map((f) => f.id)}
          rotulo="experiência"
          onMover={move}
        >
          <div className="space-y-4">
            {fields.map((campo, i) => {
              const erro = errors.experiencias?.[i];
              return (
                <ItemOrdenavel
                  key={campo.id}
                  id={campo.id}
                  rotuloAlca={`Reordenar experiência ${i + 1}`}
                  desabilitado={fields.length < 2}
                >
                  {(alca) =>
                    campo.id === aberta ? (
                      <CartaoItem
                        titulo={`Experiência ${i + 1}`}
                        aside="Mais recente primeiro"
                        rotuloRemover={`Remover experiência ${i + 1}`}
                        alca={alca}
                        exibir={
                          <InterruptorExibir
                            name={`experiencias.${i}.exibir`}
                            rotulo={`Exibir experiência ${i + 1} no CV`}
                          />
                        }
                        onRemover={() => {
                          remove(i);
                          setAberta(null);
                        }}
                      >
                        <ExperienciaCampos indice={i} />
                      </CartaoItem>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        {alca}
                        <ExperienciaRecolhida
                          indice={i}
                          aviso={
                            erro?.inicio || erro?.fim
                              ? "Data fora do padrão"
                              : erro
                                ? "Revise os campos"
                                : undefined
                          }
                          onAbrir={() => setAberta(campo.id)}
                        />
                        <InterruptorExibir
                          name={`experiencias.${i}.exibir`}
                          rotulo={`Exibir experiência ${i + 1} no CV`}
                        />
                      </div>
                    )
                  }
                </ItemOrdenavel>
              );
            })}
          </div>
        </ListaOrdenavel>
        <AdicionarItem
          textoAdicionar="Adicionar experiência"
          onAdicionar={() => {
            const nova = criarExperienciaVazia();
            append(nova);
            setAberta(nova.id);
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
      className="border-line bg-paper rounded-card flex min-h-14 min-w-0 flex-1 items-center justify-between gap-3 border px-5 py-3 text-left"
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
