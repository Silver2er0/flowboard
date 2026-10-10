import { db } from "@/lib/db";
import { toCsv } from "@/lib/csv";
import { readSession } from "@/lib/session";

export async function GET() {
  const userId = await readSession();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const rows = await db.application.findMany({ where: { userId }, orderBy: { appliedAt: "desc" } });
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="flowboard-applications.csv"',
    },
  });
}
