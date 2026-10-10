import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSession } from "./session";

/** Current user, or null. Deduplicated per request. */
export const getUser = cache(async () => {
  const id = await readSession();
  return id ? db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } }) : null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
