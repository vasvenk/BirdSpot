"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { isAuthenticated, refreshProfile, supabase } = useAuth();
  const [displayName, setDisplayName] = useState("");
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
          Join BirdSpot
        </h1>
        <p className="text-sm leading-6 text-[color:var(--color-ink)]/76">
          Create an account to post sightings, reply to threads, and help other birders build the
          feed.
        </p>
      </div>

      <form
        className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);

          try {
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  display_name: displayName,
                },
              },
            });

            if (error) {
              throw error;
            }

            if (data.session) {
              await fetch("/api/auth/sync-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  displayName,
                }),
              }).catch(() => null);
              await refreshProfile();
              toast.success("Account created");
              router.replace(redirect);
            } else {
              toast.success("Check your email to confirm the account, then sign in.");
              router.replace("/login");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to sign up");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div>
          <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
            Display name
          </label>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
          />
        </div>
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
          <label className="mb-2 block text-sm font-semibold text-[color:var(--color-forest)]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="min-h-12 w-full rounded-2xl border border-[color:var(--color-moss)]/22 bg-[color:var(--color-paper)] px-4 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[color:var(--color-forest)] px-5 py-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-[color:var(--color-forest)]/72">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[color:var(--color-forest)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
