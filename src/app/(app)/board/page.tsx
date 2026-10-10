import { Board } from "@/components/Board";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import type { Card } from "@/lib/status";

export const metadata = { title: "Board - Flowboard" };

export default async function BoardPage() {
  const user = await requireUser();
  const rows = await db.application.findMany({ where: { userId: user.id }, orderBy: { position: "asc" } });
  const cards: Card[] = rows.map((r) => ({ ...r, appliedAt: r.appliedAt.toISOString() }));
  return <Board cards={cards} />;
}
