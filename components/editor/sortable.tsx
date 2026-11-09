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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

const INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    "Para reordenar, aperte espaço, use as setas para cima e para baixo e aperte espaço de novo para soltar. Esc cancela.",
};

/** `ids` na ordem atual; `onMover(de, para)` recebe os índices. */
export const SortableList = ({
  ids,
  label,
  onMove,
  children,
}: {
  ids: string[];
  /** Ex.: "experiência": usado nos avisos para leitores de tela. */
  label: string;
  onMove: (from: number, to: number) => void;
  children: ReactNode;
}) => {
  const sensors = useSensors(
    // Distância mínima: um clique no botão não vira arrasto.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const pos = (id: string | number) => ids.indexOf(String(id)) + 1;
  const warnings: Announcements = {
    onDragStart: ({ active }) =>
      `Pegou ${label} ${pos(active.id)} de ${ids.length}.`,
    onDragOver: ({ over }) =>
      over ? `Agora na posição ${pos(over.id)}.` : undefined,
    onDragEnd: ({ over }) =>
      over ? `Soltou na posição ${pos(over.id)}.` : undefined,
    onDragCancel: () => "Reordenação cancelada.",
  };

  function onDrop({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext
      id={`ordem-${label}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDrop}
      accessibility={{
        announcements: warnings,
        screenReaderInstructions: INSTRUCTIONS,
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

/** Alça de arrastar (também por teclado). */
export type Handle = ReactNode;

export const SortableItem = ({
  id,
  handleLabel,
  disabled,
  children,
}: {
  id: string;
  handleLabel: string;
  /** Com um único item não há o que reordenar. */
  disabled?: boolean;
  children: (handle: Handle) => ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const handle = disabled ? null : (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={handleLabel}
      className="text-muted hover:bg-accent-soft hover:text-accent-deep inline-flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg transition-colors active:cursor-grabbing"
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
      {children(handle)}
    </div>
  );
};
