import Link from "next/link";
import { demoLogin } from "./actions";
import { getUser } from "@/lib/dal";
import { STATUSES, STATUS_META } from "@/lib/status";

const FEATURES = [
  ["Drag and drop pipeline", "Move applications from Wishlist to Offer; order is saved on the server instantly."],
  ["Server-rendered", "Every page is rendered on the server with Next.js, so the board is there on first paint."],
  ["Stats that matter", "Response rate, interview rate and weekly activity, computed in the database."],
  ["Own your data", "Export everything to CSV any time."],
];

export default async function Home() {
  const user = await getUser();
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <nav className="mb-20 flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">Flowboard</span>
        <div className="flex gap-2">
          {user ? (
            <Link href="/board" className="btn btn-primary">Open board</Link>
          ) : (
            <>
              <Link href="/login" className="btn">Sign in</Link>
              <Link href="/register" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </nav>
      <section className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight">Run your job search like a pipeline.</h1>
        <p className="mt-5 text-lg text-slate-600 dark:text-slate-400">
          Track every application on a kanban board, see your conversion funnel, and never lose track of a follow-up.
        </p>
        <form action={demoLogin} className="mt-8 flex flex-wrap items-center gap-3">
          <button className="btn btn-primary px-5 py-3 text-base">Try the live demo</button>
          <span className="text-sm text-slate-500">No sign-up: you get a private sandbox with sample data.</span>
        </form>
      </section>
      <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900">
            <span className={`size-2.5 rounded-full ${STATUS_META[s].dot}`} />
            {STATUS_META[s].label}
          </div>
        ))}
      </div>
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(([title, text]) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
