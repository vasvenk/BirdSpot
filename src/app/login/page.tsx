"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { isAuthenticated, refreshProfile, supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  return (
    <div className="mx-auto max-w-md space-y-6 pb-34 pt-6">
      <div className="space-y-2 text-center">
        <h1 className="font-[family:var(--font-display)] text-4xl text-[color:var(--color-forest)]">
          Welcome back
        </h1>
        <p className="text-sm leading-6 text-[color:var(--color-ink)]/76">
          Sign in to like sightings, comment, and add your own photos.
        </p>
      </div>

      <form
        className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);

          try {
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) {
              throw error;
            }

            await fetch("/api/auth/sync-user", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({}),
            }).catch(() => null);
            await refreshProfile();
            toast.success("Signed in");
            router.replace(redirect);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to sign in");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[color:var(--color-forest)] px-5 py-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-[color:var(--color-forest)]/72">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-[color:var(--color-forest)]">
          Create an account
        </Link>
      </p>
    </div>
  );
}
