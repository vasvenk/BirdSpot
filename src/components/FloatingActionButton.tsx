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
      className="fixed bottom-28 right-5 z-40 flex h-15 w-15 items-center justify-center rounded-full bg-[color:var(--color-forest)] text-white shadow-[0_20px_40px_rgba(46,78,56,0.25)] transition hover:scale-[1.03]"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
