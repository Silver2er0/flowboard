import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { STATUSES, STATUS_META, type Status } from "@/lib/status";

export const metadata = { title: "Stats - Flowboard" };

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export default async function StatsPage() {
  const { id } = await requireUser();
  const [grouped, weekly] = await Promise.all([
    db.application.groupBy({ by: ["status"], where: { userId: id }, _count: true }),
    db.$queryRaw<{ week: Date; count: number }[]>`
      SELECT date_trunc('week', "appliedAt") AS week, COUNT(*)::int AS count
      FROM "Application" WHERE "userId" = ${id} AND status <> 'WISHLIST'
      GROUP BY 1 ORDER BY 1 DESC LIMIT 8`,
  ]);
  const count = Object.fromEntries(STATUSES.map((s) => [s, grouped.find((g) => g.status === s)?._count ?? 0])) as Record<Status, number>;
  const total = STATUSES.reduce((sum, s) => sum + count[s], 0);
  const sent = total - count.WISHLIST;
  const reached = count.INTERVIEW + count.OFFER;
  const weeks = weekly.toReversed();
  const peak = Math.max(1, ...weeks.map((w) => w.count));

  const kpis = [
    ["Applications sent", sent],
    ["Interview rate", `${pct(reached, sent)}%`],
    ["Offer rate", `${pct(count.OFFER, sent)}%`],
    ["Rejections", count.REJECTED],
  ];

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">Pipeline</h2>
        <div className="space-y-3">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-slate-500">{STATUS_META[s].label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                <div className={`h-full ${STATUS_META[s].dot}`} style={{ width: `${pct(count[s], total)}%` }} />
              </div>
              <span className="w-6 text-right font-medium">{count[s]}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-semibold">Applications per week</h2>
        {weeks.length ? (
          <div className="flex h-44 gap-3">
            {weeks.map((w) => (
              <div key={w.week.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-medium">{w.count}</span>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t bg-indigo-500" style={{ height: `${(w.count / peak) * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-500">{w.week.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nothing yet. Move a card to Applied to start tracking.</p>
        )}
      </section>
    </main>
  );
}
