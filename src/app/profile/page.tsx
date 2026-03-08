"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import { PencilLine, LogOut } from "lucide-react";

import { AuthGuard } from "@/components/AuthGuard";
import { Avatar } from "@/components/Avatar";
import { SightingCard } from "@/components/SightingCard";
import { fetchJson } from "@/lib/fetcher";
import { fileToAvatarDataUrl } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";
import { useSightings } from "@/hooks/useSightings";
import type { CurrentUserResponse } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { appUser, refreshProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const currentUser = useSWR<CurrentUserResponse>("/api/users/me", fetchJson);
  const sightings = useSightings({
    endpoint: appUser ? `/api/users/${appUser.id}/sightings` : null,
    limit: 8,
  });

  useEffect(() => {
    if (currentUser.data?.user) {
      setDisplayName(currentUser.data.user.displayName);
      setAvatarUrl(currentUser.data.user.avatarUrl);
    }
  }, [currentUser.data?.user]);

  useEffect(() => {
    if (!sightings.hasMore || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !sightings.isLoadingMore) {
          void sightings.setSize((size) => size + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [sightings]);

  return (
    <AuthGuard>
      <div className="space-y-6 pb-34">
        <section className="space-y-5 rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(62,86,60,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <Avatar src={avatarUrl ?? currentUser.data?.user.avatarUrl} name={displayName || "BirdSpot user"} size={68} className="h-17 w-17 rounded-full object-cover" />
              <div>
                <h1 className="font-[family:var(--font-display)] text-3xl text-[color:var(--color-forest)]">
                  {currentUser.data?.user.displayName ?? "Your profile"}
                </h1>
                <p className="text-sm text-[color:var(--color-forest)]/68">
                  {currentUser.data?.sightingsCount ?? sightings.items.length} sightings shared
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className="flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--color-moss)]/14 px-4 text-sm font-semibold text-[color:var(--color-forest)]"
            >
              <PencilLine className="h-4 w-4" />
              Edit
            </button>
          </div>

          {editing ? (
            <div className="space-y-3 rounded-[26px] border border-[color:var(--color-moss)]/20 bg-[color:var(--color-paper)] p-4">
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                className="min-h-11 w-full rounded-2xl border border-[color:var(--color-moss)]/24 bg-white px-4 text-sm"
              />
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  try {
                    const nextAvatar = await fileToAvatarDataUrl(file);
                    setAvatarUrl(nextAvatar);
                  } catch {
                    toast.error("Unable to process avatar");
                  }
                }}
                className="block min-h-11 w-full text-sm"
              />
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);

                  try {
                    const response = await fetch("/api/users/me", {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      credentials: "include",
                      body: JSON.stringify({
                        displayName,
                        avatarUrl,
                      }),
                    });
                    const payload = await response.json();

                    if (!response.ok) {
                      throw new Error(payload?.error ?? "Unable to update profile");
                    }

                    await Promise.all([refreshProfile(), currentUser.mutate()]);
                    setEditing(false);
                    toast.success("Profile updated");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to update profile");
                  } finally {
                    setSaving(false);
                  }
                }}
                className="min-h-11 rounded-full bg-[color:var(--color-forest)] px-4 text-sm font-semibold text-white"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.replace("/");
            }}
            className="flex min-h-11 items-center gap-2 rounded-full bg-rose-50 px-4 text-sm font-semibold text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--color-forest)]">Your sightings</h2>
            <p className="text-sm text-[color:var(--color-forest)]/68">
              Everything you’ve shared so far.
            </p>
          </div>

          {sightings.items.length ? (
            <div className="space-y-4">
              {sightings.items.map((sighting) => (
                <SightingCard key={sighting.id} sighting={sighting} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[color:var(--color-moss)]/35 bg-white/65 p-8 text-center text-sm text-[color:var(--color-forest)]/72">
              You haven’t posted any sightings yet.
            </div>
          )}

          <div ref={sentinelRef} className="h-12 text-center text-sm text-[color:var(--color-forest)]/58">
            {sightings.hasMore ? "Loading more…" : "End of your sightings"}
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
