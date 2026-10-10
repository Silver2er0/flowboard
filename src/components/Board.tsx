"use client";

import { useOptimistic, useState, startTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { moveApplication } from "@/app/actions";
import { positionBetween } from "@/lib/ordering";
import { STATUSES, STATUS_META, type Card, type Status } from "@/lib/status";
import { ApplicationDialog } from "./ApplicationDialog";

type Move = { id: string; status: Status; position: number };
type Editing = { card?: Card; status: Status } | null;

const date = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });

function CardView({ card, className = "" }: { card: Card; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <p className="font-semibold leading-tight">{card.company}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">{card.role}</p>
      <p className="mt-2 flex flex-wrap gap-x-3 text-xs text-slate-500">
        <span>{date(card.appliedAt)}</span>
        {card.location && <span>{card.location}</span>}
        {card.salary && <span>{card.salary}</span>}
      </p>
    </div>
  );
}

function DraggableCard({ card, onOpen }: { card: Card; onOpen: () => void }) {
  const drag = useDraggable({ id: card.id });
  const drop = useDroppable({ id: card.id });
  return (
    <div
      ref={(node) => {
        drag.setNodeRef(node);
        drop.setNodeRef(node);
      }}
      {...drag.listeners}
      {...drag.attributes}
      onClick={onOpen}
      className="cursor-grab touch-manipulation"
    >
      <CardView card={card} className={drag.isDragging ? "opacity-40" : drop.isOver ? "ring-2 ring-indigo-400" : "hover:border-indigo-400"} />
    </div>
  );
}

function Column({ status, cards, onEdit }: { status: Status; cards: Card[]; onEdit: (editing: Editing) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section className={`flex min-w-0 flex-1 basis-0 flex-col rounded-2xl p-3 ${isOver ? "bg-indigo-100/70 dark:bg-indigo-950/40" : "bg-slate-200/60 dark:bg-slate-900/60"}`}>
      <header className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold">
        <span className={`size-2.5 rounded-full ${STATUS_META[status].dot}`} />
        {STATUS_META[status].label}
        <span className="text-slate-500">{cards.length}</span>
        <button onClick={() => onEdit({ status })} className="ml-auto rounded px-1.5 text-lg leading-none text-slate-500 hover:bg-slate-300/60 dark:hover:bg-slate-700" aria-label={`Add to ${STATUS_META[status].label}`}>
          +
        </button>
      </header>
      <div ref={setNodeRef} className="flex min-h-24 flex-1 flex-col gap-2">
        {cards.map((card) => (
          <DraggableCard key={card.id} card={card} onOpen={() => onEdit({ card, status })} />
        ))}
      </div>
    </section>
  );
}

export function Board({ cards: initial }: { cards: Card[] }) {
  const [cards, applyMove] = useOptimistic(initial, (state, m: Move) =>
    state.map((c) => (c.id === m.id ? { ...c, status: m.status, position: m.position } : c)).sort((a, b) => a.position - b.position),
  );
  const [editing, setEditing] = useState<Editing>(null);
  const [dragging, setDragging] = useState<Card | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    setDragging(null);
    const card = cards.find((c) => c.id === active.id);
    const target = cards.find((c) => c.id === over?.id);
    if (!card || !over || over.id === active.id) return;
    const status = target ? target.status : (over.id as Status);
    const original = cards.filter((c) => c.status === status);
    const column = original.filter((c) => c.id !== card.id);
    // Dropping on a card: land before it, or after it when moving down inside the same column.
    const movedDown = target && card.status === status && original.indexOf(card) < original.indexOf(target);
    const index = target ? column.indexOf(target) + (movedDown ? 1 : 0) : column.length;
    const position = positionBetween(column[index - 1]?.position, column[index]?.position);
    startTransition(async () => {
      applyMove({ id: card.id, status, position });
      await moveApplication(card.id, status, position);
    });
  }

  return (
    <main className="flex-1 overflow-x-auto p-4">
      <DndContext id="board" sensors={sensors} collisionDetection={pointerWithin} onDragStart={({ active }) => setDragging(cards.find((c) => c.id === active.id) ?? null)} onDragEnd={onDragEnd} onDragCancel={() => setDragging(null)}>
        <div className="flex min-w-[56rem] items-start gap-3">
          {STATUSES.map((status) => (
            <Column key={status} status={status} cards={cards.filter((c) => c.status === status)} onEdit={setEditing} />
          ))}
        </div>
        <DragOverlay>{dragging && <CardView card={dragging} className="rotate-2 shadow-xl" />}</DragOverlay>
      </DndContext>
      {editing && <ApplicationDialog card={editing.card} status={editing.status} onClose={() => setEditing(null)} />}
    </main>
  );
}
