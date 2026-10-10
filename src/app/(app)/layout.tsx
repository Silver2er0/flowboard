import Link from "next/link";
import { logout } from "../actions";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <header className="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <Link href="/" className="font-bold tracking-tight">Flowboard</Link>
        <nav className="flex gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/board" className="hover:text-indigo-600">Board</Link>
          <Link href="/stats" className="hover:text-indigo-600">Stats</Link>
          <a href="/api/export" className="hover:text-indigo-600">Export CSV</a>
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden text-slate-500 sm:inline">{user.name}</span>
          <form action={logout}>
            <button className="btn py-1.5">Log out</button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
