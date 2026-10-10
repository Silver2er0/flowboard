"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { createDemoUser } from "@/lib/demo";
import { positionBetween } from "@/lib/ordering";
import { applicationSchema, credentialsSchema } from "@/lib/schemas";
import { createSession, destroySession } from "@/lib/session";
import { STATUSES, type Status } from "@/lib/status";

export type FormState = { error?: string; ok?: boolean };

const firstError = (error: z.ZodError) => error.issues[0].message;
const form = (data: FormData) => Object.fromEntries(data);

export async function register(_: FormState, data: FormData): Promise<FormState> {
  const parsed = credentialsSchema.extend({ name: z.string().trim().min(1, "Name is required").max(80) }).safeParse(form(data));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "That email is already registered" };
  const user = await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  await createSession(user.id);
  redirect("/board");
}

export async function login(_: FormState, data: FormData): Promise<FormState> {
  const parsed = credentialsSchema.safeParse(form(data));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return { error: "Invalid email or password" };
  await createSession(user.id);
  redirect("/board");
}

export async function demoLogin() {
  await createSession((await createDemoUser()).id);
  redirect("/board");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const refresh = () => {
  revalidatePath("/board");
  revalidatePath("/stats");
};

export async function saveApplication(_: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = applicationSchema.safeParse(form(data));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const id = data.get("id");
  const existing = typeof id === "string" && id ? await db.application.findFirst({ where: { id, userId: user.id } }) : null;
  if (existing && existing.status === parsed.data.status) {
    await db.application.update({ where: { id: existing.id }, data: parsed.data });
  } else {
    const last = await db.application.findFirst({
      where: { userId: user.id, status: parsed.data.status },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = positionBetween(last?.position);
    if (existing) await db.application.update({ where: { id: existing.id }, data: { ...parsed.data, position } });
    else await db.application.create({ data: { ...parsed.data, position, userId: user.id } });
  }
  refresh();
  return { ok: true };
}

export async function deleteApplication(id: string) {
  const user = await requireUser();
  await db.application.deleteMany({ where: { id, userId: user.id } });
  refresh();
}

export async function moveApplication(id: string, status: Status, position: number) {
  const user = await requireUser();
  if (!STATUSES.includes(status) || !Number.isFinite(position)) return;
  await db.application.updateMany({ where: { id, userId: user.id }, data: { status, position } });
  refresh();
}
