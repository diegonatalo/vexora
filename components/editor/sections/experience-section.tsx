"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { SortableItem, SortableList } from "@/components/editor/sortable";
import {
  AddItem,
  MonthYearField,
  CardItem,
  VisibilityToggle,
  SectionHeader,
} from "@/components/editor/form-fields";
import {
  CheckboxField,
  TextAreaField,
  TextField,
} from "@/components/ui/fields";
import { Icon } from "@/components/ui/icons";
import { createEmptyExperience, LIMITS, type Profile } from "@/lib/schema";

const LIMIT = LIMITS.charactersPerBullet;

export const ExperienceSection = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experiences",
  });
  // Guarda os ids (não as posições): as abertas acompanham a reordenação.
  // Pode haver várias abertas; cada uma tem "Recolher".
  const [opened, setOpened] = useState<Set<string>>(
    () => new Set(fields.slice(0, 1).map((f) => f.id)),
  );
  const toggle = (id: string, open: boolean) =>
    setOpened((current) => {
      const fresh = new Set(current);
      if (open) fresh.add(id);
      else fresh.delete(id);
      return fresh;
    });

  return (
    <>
      <SectionHeader
        title="Experiência"
        icon="briefcase"
        description={`Até ${LIMITS.bulletsPerExperience} tópicos por experiência. Use "Exibir no CV" para ocultar uma experiência sem apagá-la.`}
      />
      <div className="space-y-4">
        <SortableList
          ids={fields.map((f) => f.id)}
          label="experiência"
          onMove={move}
        >
          <div className="space-y-4">
            {fields.map((field, i) => {
              const error = errors.experiences?.[i];
              return (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  handleLabel={`Reordenar experiência ${i + 1}`}
                  disabled={fields.length < 2}
                >
                  {(handle) =>
                    opened.has(field.id) ? (
                      <CardItem
                        title={`Experiência ${i + 1}`}
                        aside="Mais recente primeiro"
                        rotuloRemover={`Remover experiência ${i + 1}`}
                        handle={handle}
                        visible={
                          <VisibilityToggle
                            name={`experiences.${i}.visible`}
                            label={`Exibir experiência ${i + 1} no CV`}
                          />
                        }
                        onCollapse={() => toggle(field.id, false)}
                        rotuloRecolher={`Recolher experiência ${i + 1}`}
                        onRemove={() => {
                          remove(i);
                          toggle(field.id, false);
                        }}
                      >
                        <ExperienceFields index={i} />
                      </CardItem>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        {handle}
                        <CollapsedExperience
                          index={i}
                          warning={
                            error?.start || error?.end
                              ? "Data fora do padrão"
                              : error
                                ? "Revise os campos"
                                : undefined
                          }
                          onOpen={() => toggle(field.id, true)}
                        />
                        <VisibilityToggle
                          name={`experiences.${i}.visible`}
                          label={`Exibir experiência ${i + 1} no CV`}
                        />
                      </div>
                    )
                  }
                </SortableItem>
              );
            })}
          </div>
        </SortableList>
        <AddItem
          addText="Adicionar experiência"
          onAdd={() => {
            const newValue = createEmptyExperience();
            append(newValue);
            toggle(newValue.id, true);
          }}
        />
      </div>
    </>
  );
};

const CollapsedExperience = ({
  index,
  warning,
  onOpen,
}: {
  index: number;
  warning?: string;
  onOpen: () => void;
}) => {
  const { control } = useFormContext<Profile>();
  const [jobTitle, company] = useWatch({
    control,
    name: [`experiences.${index}.jobTitle`, `experiences.${index}.company`],
  });
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-expanded={false}
      className="border-line bg-surface hover:border-accent flex min-h-16 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition duration-150 hover:shadow-md"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="bg-accent text-on-accent grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold">
          {index + 1}
        </span>
        <span className="min-w-0">
          <span className="font-display block truncate font-semibold">
            Experiência {index + 1}
          </span>
          <span className="text-muted block truncate text-sm">
            {jobTitle || "[Cargo]"} · {company || "[Empresa]"}
          </span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        {warning && (
          <span className="bg-warn-bg text-warn-ink inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
            <Icon name="alert" size={16} className="text-warn-icon" />
            {warning}
          </span>
        )}
        <Icon name="chevron-down" className="text-muted" />
      </span>
    </button>
  );
};

const ExperienceFields = ({ index }: { index: number }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Profile>();
  const error = errors.experiences?.[index];
  const current = useWatch({ control, name: `experiences.${index}.current` });
  const bullets = useWatch({ control, name: `experiences.${index}.bullets` });
  const base = `experiences.${index}` as const;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Cargo"
          placeholder="[Cargo]"
          error={error?.jobTitle?.message}
          {...register(`${base}.jobTitle`)}
        />
        <TextField
          label="Empresa"
          placeholder="[Empresa]"
          error={error?.company?.message}
          {...register(`${base}.company`)}
        />
      </div>
      <TextField
        label="Cidade e UF (opcional)"
        placeholder="[Cidade/UF]"
        error={error?.cityState?.message}
        {...register(`${base}.cityState`)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <MonthYearField name={`${base}.start`} label="Início" />
        <MonthYearField name={`${base}.end`} label="Fim" disabled={current} />
      </div>
      <CheckboxField
        label="Trabalho aqui atualmente"
        {...register(`${base}.current`)}
      />
      <div>
        <h4 className="mb-2 font-medium">Tópicos</h4>
        <div className="space-y-4">
          {Array.from({ length: LIMITS.bulletsPerExperience }, (_, j) => {
            const size = bullets?.[j]?.length ?? 0;
            return (
              <TextAreaField
                key={j}
                label={`Tópico ${j + 1} · ${size}/${LIMIT}`}
                rows={2}
                placeholder={
                  j === 2
                    ? "Comece com um verbo de ação: desenvolvi, reduzi, liderei…"
                    : "[Verbo de ação] + [o que você fez] + [resultado ou métrica]"
                }
                error={error?.bullets?.[j]?.message}
                {...register(`${base}.bullets.${j}`)}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};
