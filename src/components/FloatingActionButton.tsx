"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export function FloatingActionButton() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/new"
      aria-label="Create a new sighting"
      className="fixed bottom-28 right-5 z-40 flex h-[62px] w-[62px] items-center justify-center rounded-full border-4 border-[color:var(--color-card)] bg-[color:var(--color-forest-strong)] text-[color:var(--color-on-forest)] shadow-[0_20px_45px_rgba(22,53,31,0.28)] transition hover:scale-[1.03]"
    >
      <Plus className="h-7 w-7" strokeWidth={2.75} />
    </Link>
  );
}
