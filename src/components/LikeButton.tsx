"use client";

import { startTransition, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type LikeButtonProps = {
  sightingId: string;
  initialLiked: boolean;
  initialCount: number;
  onChange?: (next: { liked: boolean; likesCount: number }) => void;
};

export function LikeButton({
  sightingId,
  initialLiked,
  initialCount,
  onChange,
}: LikeButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/sighting/${sightingId}`)}`);
      return;
    }

    if (pending) {
      return;
    }

    const optimisticLiked = !liked;
    const optimisticCount = optimisticLiked ? count + 1 : Math.max(count - 1, 0);

    startTransition(() => {
      setLiked(optimisticLiked);
      setCount(optimisticCount);
    });
    setPending(true);

    try {
      const response = await fetch(`/api/sightings/${sightingId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to update like");
      }

      setLiked(payload.liked);
      setCount(payload.likesCount);
      onChange?.(payload);
    } catch (error) {
      setLiked(liked);
      setCount(count);
      toast.error(error instanceof Error ? error.message : "Unable to update like");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={liked ? "Unlike sighting" : "Like sighting"}
      aria-pressed={liked}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        liked
          ? "bg-rose-100 text-rose-700"
          : "bg-[color:var(--color-moss)]/12 text-[color:var(--color-forest)]",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-current")} />
      {count}
    </button>
  );
}
