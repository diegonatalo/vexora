"use client";

import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  AddItem,
  ListField,
  MonthYearField,
  CardItem,
  VisibilityToggle,
  SectionHeader,
} from "@/components/editor/form-fields";
import { SortableItem, SortableList } from "@/components/editor/sortable";
import { BUTTON } from "@/components/ui/styles";
import { CheckboxField, TextField } from "@/components/ui/fields";
import { newId, type Profile } from "@/lib/schema";

export function EducationSection() {
  const { control } = useFormContext<Profile>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "educations",
  });
  return (
    <>
      <SectionHeader
        title="Formação"
        icon="graduation"
        description="Graduação, técnico ou curso relevante, do mais recente para o mais antigo."
      />
      <div className="space-y-4">
        <SortableList
          ids={fields.map((f) => f.id)}
          label="formação"
          onMove={move}
        >
          <div className="space-y-4">
            {fields.map((field, i) => (
              <SortableItem
                key={field.id}
                id={field.id}
                handleLabel={`Reordenar formação ${i + 1}`}
                disabled={fields.length < 2}
              >
                {(handle) => (
                  <CardItem
                    title={`Formação ${i + 1}`}
                    rotuloRemover={`Remover formação ${i + 1}`}
                    onRemove={() => remove(i)}
                    handle={handle}
                    visible={
                      <VisibilityToggle
                        name={`educations.${i}.visible`}
                        label={`Exibir formação ${i + 1} no CV`}
                      />
                    }
                  >
                    <EducationFields index={i} />
                  </CardItem>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
        <AddItem
          addText="Adicionar formação"
          onAdd={() =>
            append({
              id: newId(),
              course: "",
              institution: "",
              start: "",
              end: "",
              current: false,
              visible: true,
            })
          }
        />
      </div>
    </>
  );
}

function EducationFields({ index }: { index: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  const error = errors.educations?.[index];
  const base = `educations.${index}` as const;
  const current = useWatch({ control, name: `${base}.current` });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Curso"
          placeholder="[Curso]"
          error={error?.course?.message}
          {...register(`${base}.course`)}
        />
        <TextField
          label="Instituição"
          placeholder="[Instituição]"
          error={error?.institution?.message}
          {...register(`${base}.institution`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <MonthYearField name={`${base}.start`} label="Início" />
        <MonthYearField name={`${base}.end`} label="Fim" disabled={current} />
      </div>
      <CheckboxField label="Ainda cursando" {...register(`${base}.current`)} />
    </>
  );
}

export function CertificationsSection() {
  const { control } = useFormContext<Profile>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "certifications",
  });
  return (
    <>
      <SectionHeader
        title="Certificações"
        icon="award"
        description="Só as que reforçam a vaga. Use “Exibir no CV” para ocultar uma sem apagá-la."
      />
      <div className="space-y-4">
        <SortableList
          ids={fields.map((f) => f.id)}
          label="certificação"
          onMove={move}
        >
          <div className="space-y-4">
            {fields.map((field, i) => (
              <SortableItem
                key={field.id}
                id={field.id}
                handleLabel={`Reordenar certificação ${i + 1}`}
                disabled={fields.length < 2}
              >
                {(handle) => (
                  <CardItem
                    title={`Certificação ${i + 1}`}
                    rotuloRemover={`Remover certificação ${i + 1}`}
                    onRemove={() => remove(i)}
                    handle={handle}
                    visible={
                      <VisibilityToggle
                        name={`certifications.${i}.visible`}
                        label={`Exibir certificação ${i + 1} no CV`}
                      />
                    }
                  >
                    <CertificationFields index={i} />
                  </CardItem>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
        <AddItem
          addText="Adicionar certificação"
          onAdd={() =>
            append({
              id: newId(),
              name: "",
              institution: "",
              year: "",
              visible: true,
            })
          }
        />
      </div>
    </>
  );
}

function CertificationFields({ index }: { index: number }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Profile>();
  const error = errors.certifications?.[index];
  const base = `certifications.${index}` as const;
  return (
    <>
      <TextField
        label="Nome da certificação"
        placeholder="[Nome da certificação]"
        error={error?.name?.message}
        {...register(`${base}.name`)}
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <TextField
          label="Instituição"
          placeholder="[Instituição]"
          error={error?.institution?.message}
          {...register(`${base}.institution`)}
        />
        <TextField
          label="Ano"
          inputMode="numeric"
          maxLength={4}
          placeholder="AAAA"
          error={error?.year?.message}
          {...register(`${base}.year`)}
        />
      </div>
    </>
  );
}

const GROUP_SUGGESTIONS = [
  "Competências",
  "Ferramentas",
  "Técnicas",
  "Comportamentais",
  "Sistemas",
] as const;

export function SkillsSection() {
  const { control, register } = useFormContext<Profile>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "skills",
  });
  const {
    fields: languages,
    append: addLanguage,
    remove: removerIdioma,
  } = useFieldArray({ control, name: "languages" });
  return (
    <>
      <SectionHeader
        title="Habilidades"
        icon="sparkles"
        description="Agrupe do seu jeito: dê um nome ao grupo e liste os itens separados por vírgula. Vale para qualquer área."
      />
      <div className="space-y-4">
        <SortableList
          ids={fields.map((f) => f.id)}
          label="grupo de habilidades"
          onMove={move}
        >
          <div className="space-y-4">
            {fields.map((field, i) => (
              <SortableItem
                key={field.id}
                id={field.id}
                handleLabel={`Reordenar grupo de habilidades ${i + 1}`}
                disabled={fields.length < 2}
              >
                {(handle) => (
                  <CardItem
                    title={`Grupo ${i + 1}`}
                    rotuloRemover={`Remover grupo de habilidades ${i + 1}`}
                    onRemove={() => remove(i)}
                    handle={handle}
                    visible={
                      <VisibilityToggle
                        name={`skills.${i}.visible`}
                        label={`Exibir grupo de habilidades ${i + 1} no CV`}
                      />
                    }
                  >
                    <TextField
                      label="Nome do grupo"
                      placeholder="[Ex.: Técnicas, Ferramentas, Atendimento]"
                      {...register(`skills.${i}.title`)}
                    />
                    <ListField
                      name={`skills.${i}.items`}
                      label="Habilidades"
                      hint="Separe por vírgula. Ex.: Excel, Atendimento ao cliente, Liderança de equipe"
                    />
                  </CardItem>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableList>
        {fields.length === 0 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Sugestões de grupos"
          >
            <span className="text-muted text-sm">Comece por um grupo:</span>
            {GROUP_SUGGESTIONS.map((name) => (
              <button
                key={name}
                type="button"
                className={`${BUTTON.secondary} min-h-11 rounded-full px-4 text-sm`}
                onClick={() =>
                  append({ title: name, items: [], visible: true })
                }
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <AddItem
          addText="Adicionar grupo de habilidades"
          onAdd={() => append({ title: "", items: [], visible: true })}
        />
      </div>

      <h3 className="font-display mt-8 mb-3 text-xl font-semibold">Idiomas</h3>
      <div className="space-y-4">
        {languages.map((field, i) => (
          <CardItem
            key={field.id}
            title={`Idioma ${i + 1}`}
            rotuloRemover={`Remover idioma ${i + 1}`}
            onRemove={() => removerIdioma(i)}
            visible={
              <VisibilityToggle
                name={`languages.${i}.visible`}
                label={`Exibir idioma ${i + 1} no CV`}
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Idioma"
                placeholder="[Idioma]"
                {...register(`languages.${i}.language`)}
              />
              <TextField
                label="Nível"
                placeholder="[nível]"
                {...register(`languages.${i}.level`)}
              />
            </div>
          </CardItem>
        ))}
        <AddItem
          addText="Adicionar idioma"
          onAdd={() =>
            addLanguage({ language: "", level: "", visible: true })
          }
        />
      </div>
    </>
  );
}
