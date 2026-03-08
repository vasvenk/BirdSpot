import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="space-y-4 rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_34px_rgba(62,86,60,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-forest)]/55">
        Offline
      </p>
      <h1 className="font-[family:var(--font-display)] text-4xl text-[color:var(--color-forest)]">
        BirdSpot is keeping the shell warm.
      </h1>
      <p className="text-sm leading-6 text-[color:var(--color-ink)]/76">
        You can still view cached screens and the last loaded feed while your connection comes back.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--color-forest)] px-5 py-3 text-sm font-semibold text-white"
      >
        Return to feed
      </Link>
    </div>
  );
}
