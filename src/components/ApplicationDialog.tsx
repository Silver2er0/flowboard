"use client";

import { useActionState, useTransition } from "react";
import { deleteApplication, saveApplication } from "@/app/actions";
import { STATUSES, STATUS_META, type Card, type Status } from "@/lib/status";

const FIELDS = [
  ["location", "Location"],
  ["salary", "Salary"],
  ["url", "Job link"],
] as const;

export function ApplicationDialog({ card, status, onClose }: { card?: Card; status: Status; onClose: () => void }) {
  const [state, action, saving] = useActionState(async (prev: Awaited<ReturnType<typeof saveApplication>>, data: FormData) => {
    const result = await saveApplication(prev, data);
    if (result.ok) onClose();
    return result;
  }, {});
  const [deleting, remove] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form action={action} role="dialog" aria-label={card ? "Edit application" : "New application"} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <h2 className="text-lg font-semibold">{card ? "Edit application" : "New application"}</h2>
        {card && <input type="hidden" name="id" value={card.id} />}
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="label">Company</span>
            <input name="company" defaultValue={card?.company} className="input" required autoFocus />
          </label>
          <label>
            <span className="label">Role</span>
            <input name="role" defaultValue={card?.role} className="input" required />
          </label>
        </div>
        <label className="block">
          <span className="label">Stage</span>
          <select name="status" defaultValue={status} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </label>
        {FIELDS.map(([name, label]) => (
          <label key={name} className="block">
            <span className="label">{label}</span>
            <input name={name} defaultValue={card?.[name] ?? ""} className="input" />
          </label>
        ))}
        <label className="block">
          <span className="label">Notes</span>
          <textarea name="notes" defaultValue={card?.notes ?? ""} rows={3} className="input" />
        </label>
        {state.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
        <div className="flex items-center gap-2 pt-1">
          {card && (
            <button type="button" className="btn text-rose-600" disabled={deleting} onClick={() => remove(async () => { await deleteApplication(card.id); onClose(); })}>
              Delete
            </button>
          )}
          <button type="button" className="btn ml-auto" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
