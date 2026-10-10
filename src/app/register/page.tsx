import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/dal";

export const metadata = { title: "Sign up - Flowboard" };

export default async function Page() {
  if (await getUser()) redirect("/board");
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <AuthForm mode="register" />
    </main>
  );
}
