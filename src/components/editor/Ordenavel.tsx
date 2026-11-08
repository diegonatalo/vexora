"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Announcements,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

const INSTRUCOES: ScreenReaderInstructions = {
  draggable:
    "Para reordenar, aperte espaço, use as setas para cima e para baixo e aperte espaço de novo para soltar. Esc cancela.",
};

/** `ids` na ordem atual; `onMover(de, para)` recebe os índices. */
export function ListaOrdenavel({
  ids,
  rotulo,
  onMover,
  children,
}: {
  ids: string[];
  /** Ex.: "experiência": usado nos avisos para leitores de tela. */
  rotulo: string;
  onMover: (de: number, para: number) => void;
  children: ReactNode;
}) {
  const sensores = useSensors(
    // Distância mínima: um clique no botão não vira arrasto.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const posicao = (id: string | number) => ids.indexOf(String(id)) + 1;
  const avisos: Announcements = {
    onDragStart: ({ active }) =>
      `Pegou ${rotulo} ${posicao(active.id)} de ${ids.length}.`,
    onDragOver: ({ over }) =>
      over ? `Agora na posição ${posicao(over.id)}.` : undefined,
    onDragEnd: ({ over }) =>
      over ? `Soltou na posição ${posicao(over.id)}.` : undefined,
    onDragCancel: () => "Reordenação cancelada.",
  };

  function aoSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const de = ids.indexOf(String(active.id));
    const para = ids.indexOf(String(over.id));
    if (de >= 0 && para >= 0) onMover(de, para);
  }

  return (
    <DndContext
      id={`ordem-${rotulo}`}
      sensors={sensores}
      collisionDetection={closestCenter}
      onDragEnd={aoSoltar}
      accessibility={{
        announcements: avisos,
        screenReaderInstructions: INSTRUCOES,
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** Alça de arrastar (também por teclado). */
export type Alca = ReactNode;

export function ItemOrdenavel({
  id,
  rotuloAlca,
  desabilitado,
  children,
}: {
  id: string;
  rotuloAlca: string;
  /** Com um único item não há o que reordenar. */
  desabilitado?: boolean;
  children: (alca: Alca) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: desabilitado });

  const alca = desabilitado ? null : (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={rotuloAlca}
      className="border-field bg-surface rounded-field text-muted inline-flex min-h-11 min-w-11 cursor-grab touch-none items-center justify-center border active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <Icon name="grip" size={20} />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-80 shadow-lg" : undefined}
    >
      {children(alca)}
    </div>
  );
}
