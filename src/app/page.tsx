"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Compass, Feather, Sparkles } from "lucide-react";

import { SightingCard } from "@/components/SightingCard";
import { useAuth } from "@/hooks/useAuth";
import { useSightings } from "@/hooks/useSightings";

export default function FeedPage() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated } = useAuth();
  const { items, hasMore, isLoadingInitialData, isLoadingMore, setSize } = useSightings({
    limit: 8,
  });

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) {
          void setSize((size) => size + 1);
        }
      },
      { rootMargin: "220px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, setSize]);

  return (
    <div className="space-y-6 pb-36">
      <section className="relative overflow-hidden rounded-[36px] border border-[color:var(--color-soft-line)]/80 bg-[radial-gradient(circle_at_top_left,rgba(120,150,113,0.34),transparent_36%),linear-gradient(135deg,#f2f5ea_0%,#fcfaf3_52%,#edf1e6_100%)] p-6 shadow-[0_16px_50px_rgba(44,72,46,0.1)]">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[color:var(--color-moss)]/20 blur-2xl" />
        <div className="absolute right-5 top-5 rounded-full border border-[color:var(--color-soft-line)] bg-white/92 px-3 py-1 text-xs font-semibold text-[color:var(--color-forest)]">
          Mobile-first PWA
        </div>

        <div className="relative max-w-sm space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-forest)] px-3 py-1 text-xs font-semibold text-white">
            <Feather className="h-4 w-4" />
            Fresh sightings from the field
          </div>
          <div className="space-y-2">
            <h1 className="font-[family:var(--font-display)] text-4xl leading-tight text-[color:var(--color-forest)]">
              Track quiet moments,
              <br />
              share wild encounters.
            </h1>
            <p className="text-sm leading-6 text-[color:var(--color-muted)]">
              BirdSpot keeps your local birding feed, shared map, photos, and discussions in one
              thumb-friendly place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-forest)] px-5 py-3 text-sm font-semibold text-[color:var(--color-paper)] shadow-[0_10px_24px_rgba(31,71,43,0.18)]"
              >
                Join the flock
              </Link>
            ) : null}
            <Link
              href="/map"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--color-soft-line)] bg-white/94 px-5 py-3 text-sm font-semibold text-[color:var(--color-forest)]"
            >
              <Compass className="h-4 w-4" />
              Explore the map
            </Link>
          </div>

          <div className="flex gap-3 text-xs text-[color:var(--color-muted)]">
            <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-soft-line)] bg-white/94 px-3 py-2">
              <Sparkles className="h-3.5 w-3.5" />
              Public read access
            </span>
            <span className="rounded-full border border-[color:var(--color-soft-line)] bg-white/94 px-3 py-2">
              Offline shell caching
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-forest)]">Recent sightings</h2>
            <p className="text-sm text-[color:var(--color-muted)]">
              Scroll for the latest reports from the community.
            </p>
          </div>
        </div>

        {isLoadingInitialData ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-[30px] bg-[color:var(--color-moss)]/12"
              />
            ))}
          </div>
        ) : items.length ? (
          <div className="space-y-4">
            {items.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} />
            ))}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-[color:var(--color-soft-line)] bg-white/75 p-8 text-center text-sm text-[color:var(--color-muted)]">
            No sightings yet. The next birder to post will set the tone.
          </div>
        )}

        <div ref={sentinelRef} className="flex h-12 items-center justify-center text-sm text-[color:var(--color-muted)]">
          {isLoadingMore ? "Loading more sightings…" : hasMore ? "Keep scrolling" : "You’re all caught up"}
        </div>
      </section>
    </div>
  );
}
