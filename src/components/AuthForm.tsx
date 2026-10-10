"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/app/actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? login : register, {});
  return (
    <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold">{isLogin ? "Welcome back" : "Create your account"}</h1>
      {!isLogin && (
        <label className="block">
          <span className="label">Name</span>
          <input name="name" className="input" autoComplete="name" required />
        </label>
      )}
      <label className="block">
        <span className="label">Email</span>
        <input name="email" type="email" className="input" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input name="password" type="password" className="input" autoComplete={isLogin ? "current-password" : "new-password"} minLength={8} required />
      </label>
      {state.error && <p role="alert" className="text-sm text-rose-600">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Please wait..." : isLogin ? "Sign in" : "Sign up"}
      </button>
      <p className="text-center text-sm text-slate-500">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/register" : "/login"} className="font-medium text-indigo-600 hover:underline">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
