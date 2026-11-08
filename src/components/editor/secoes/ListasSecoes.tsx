"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  AdicionarItem,
  CampoLista,
  CampoMesAno,
  CartaoItem,
  InterruptorExibir,
  SecaoCabecalho,
} from "@/components/editor/campos";
import { ItemOrdenavel, ListaOrdenavel } from "@/components/editor/Ordenavel";
import { CheckboxField, TextField } from "@/components/ui/fields";
import { novoId, type Perfil } from "@/lib/schema";

export function FormacaoSecao() {
  const { control } = useFormContext<Perfil>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "formacoes",
  });
  return (
    <>
      <SecaoCabecalho
        titulo="Formação"
        descricao="Graduação, técnico ou curso relevante, do mais recente para o mais antigo."
      />
      <div className="space-y-4">
        <ListaOrdenavel
          ids={fields.map((f) => f.id)}
          rotulo="formação"
          onMover={move}
        >
          <div className="space-y-4">
            {fields.map((campo, i) => (
              <ItemOrdenavel
                key={campo.id}
                id={campo.id}
                rotuloAlca={`Reordenar formação ${i + 1}`}
                desabilitado={fields.length < 2}
              >
                {(alca) => (
                  <CartaoItem
                    titulo={`Formação ${i + 1}`}
                    rotuloRemover={`Remover formação ${i + 1}`}
                    onRemover={() => remove(i)}
                    alca={alca}
                    exibir={
                      <InterruptorExibir
                        name={`formacoes.${i}.exibir`}
                        rotulo={`Exibir formação ${i + 1} no CV`}
                      />
                    }
                  >
                    <FormacaoCampos indice={i} />
                  </CartaoItem>
                )}
              </ItemOrdenavel>
            ))}
          </div>
        </ListaOrdenavel>
        <AdicionarItem
          textoAdicionar="Adicionar formação"
          onAdicionar={() =>
            append({
              id: novoId(),
              curso: "",
              instituicao: "",
              inicio: "",
              fim: "",
              atual: false,
              exibir: true,
            })
          }
        />
      </div>
    </>
  );
}

function FormacaoCampos({ indice }: { indice: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Perfil>();
  const erro = errors.formacoes?.[indice];
  const base = `formacoes.${indice}` as const;
  const atual = useWatch({ control, name: `${base}.atual` });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Curso"
          placeholder="[Curso]"
          error={erro?.curso?.message}
          {...register(`${base}.curso`)}
        />
        <TextField
          label="Instituição"
          placeholder="[Instituição]"
          error={erro?.instituicao?.message}
          {...register(`${base}.instituicao`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoMesAno name={`${base}.inicio`} label="Início" />
        <CampoMesAno name={`${base}.fim`} label="Fim" disabled={atual} />
      </div>
      <CheckboxField label="Ainda cursando" {...register(`${base}.atual`)} />
    </>
  );
}

export function CertificacoesSecao() {
  const { control } = useFormContext<Perfil>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "certificacoes",
  });
  return (
    <>
      <SecaoCabecalho
        titulo="Certificações"
        descricao="Só as que reforçam a vaga. Na adaptação à vaga, a Vexora pode ocultar as sem relação para manter 1 página."
      />
      <div className="space-y-4">
        <ListaOrdenavel
          ids={fields.map((f) => f.id)}
          rotulo="certificação"
          onMover={move}
        >
          <div className="space-y-4">
            {fields.map((campo, i) => (
              <ItemOrdenavel
                key={campo.id}
                id={campo.id}
                rotuloAlca={`Reordenar certificação ${i + 1}`}
                desabilitado={fields.length < 2}
              >
                {(alca) => (
                  <CartaoItem
                    titulo={`Certificação ${i + 1}`}
                    rotuloRemover={`Remover certificação ${i + 1}`}
                    onRemover={() => remove(i)}
                    alca={alca}
                    exibir={
                      <InterruptorExibir
                        name={`certificacoes.${i}.exibir`}
                        rotulo={`Exibir certificação ${i + 1} no CV`}
                      />
                    }
                  >
                    <CertificacaoCampos indice={i} />
                  </CartaoItem>
                )}
              </ItemOrdenavel>
            ))}
          </div>
        </ListaOrdenavel>
        <AdicionarItem
          textoAdicionar="Adicionar certificação"
          onAdicionar={() =>
            append({
              id: novoId(),
              nome: "",
              instituicao: "",
              ano: "",
              exibir: true,
            })
          }
        />
      </div>
    </>
  );
}

function CertificacaoCampos({ indice }: { indice: number }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Perfil>();
  const erro = errors.certificacoes?.[indice];
  const base = `certificacoes.${indice}` as const;
  return (
    <>
      <TextField
        label="Nome da certificação"
        placeholder="[Nome da certificação]"
        error={erro?.nome?.message}
        {...register(`${base}.nome`)}
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <TextField
          label="Instituição"
          placeholder="[Instituição]"
          error={erro?.instituicao?.message}
          {...register(`${base}.instituicao`)}
        />
        <TextField
          label="Ano"
          inputMode="numeric"
          maxLength={4}
          placeholder="AAAA"
          error={erro?.ano?.message}
          {...register(`${base}.ano`)}
        />
      </div>
    </>
  );
}

export function HabilidadesSecao() {
  const { control, register } = useFormContext<Perfil>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "idiomas",
  });
  return (
    <>
      <SecaoCabecalho
        titulo="Habilidades"
        descricao="Liste só o que você realmente conhece. Separe os itens por vírgula."
      />
      <div className="space-y-4">
        <CampoLista
          name="habilidades.linguagens"
          label="Linguagens"
          hint="Ex.: TypeScript, JavaScript, HTML, CSS"
        />
        <CampoLista
          name="habilidades.frameworks"
          label="Frameworks e bibliotecas"
          hint="Ex.: React, Next.js, Tailwind CSS"
        />
        <CampoLista
          name="habilidades.ferramentas"
          label="Ferramentas"
          hint="Ex.: Git, Docker, Figma"
        />
      </div>

      <h3 className="font-display mt-8 mb-3 text-xl font-semibold">Idiomas</h3>
      <div className="space-y-4">
        {fields.map((campo, i) => (
          <CartaoItem
            key={campo.id}
            titulo={`Idioma ${i + 1}`}
            rotuloRemover={`Remover idioma ${i + 1}`}
            onRemover={() => remove(i)}
            exibir={
              <InterruptorExibir
                name={`idiomas.${i}.exibir`}
                rotulo={`Exibir idioma ${i + 1} no CV`}
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Idioma"
                placeholder="[Idioma]"
                {...register(`idiomas.${i}.idioma`)}
              />
              <TextField
                label="Nível"
                placeholder="[nível]"
                {...register(`idiomas.${i}.nivel`)}
              />
            </div>
          </CartaoItem>
        ))}
        <AdicionarItem
          textoAdicionar="Adicionar idioma"
          onAdicionar={() => append({ idioma: "", nivel: "", exibir: true })}
        />
      </div>
    </>
  );
}
