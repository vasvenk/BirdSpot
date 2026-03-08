"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Heart, MessageCircle, MapPin } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { formatFeedDate, getLocationLabel } from "@/lib/utils";
import type { SightingSummary } from "@/types";

type SightingCardProps = {
  sighting: SightingSummary;
};

export function SightingCard({ sighting }: SightingCardProps) {
  const image = sighting.firstPhoto?.thumbnailData ?? sighting.firstPhoto?.imageData ?? null;

  return (
    <Link
      href={`/sighting/${sighting.id}`}
      className="block overflow-hidden rounded-[28px] border border-white/70 bg-[color:var(--color-card)] shadow-[0_12px_40px_rgba(62,86,60,0.08)] transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[color:var(--color-moss)]/12">
        {image ? (
          <img
            src={image}
            alt={sighting.birdName}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[color:var(--color-forest)]/60">
            No photo yet
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <Avatar src={sighting.author.avatarUrl} name={sighting.author.displayName} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[color:var(--color-forest)]">
              {sighting.author.displayName}
            </p>
            <p className="text-xs text-[color:var(--color-forest)]/65">{formatFeedDate(sighting.date)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-[color:var(--color-forest)]">{sighting.birdName}</h3>
          {sighting.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--color-ink)]/80">
              {sighting.description}
            </p>
          ) : null}
        </div>

        <p className="flex items-center gap-2 text-sm text-[color:var(--color-forest)]/70">
          <MapPin className="h-4 w-4" />
          {getLocationLabel(
            sighting.latitude,
            sighting.longitude,
            sighting.locationType,
            sighting.radiusMeters,
          )}
        </p>

        <div className="flex items-center gap-4 text-sm font-medium text-[color:var(--color-forest)]/75">
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {sighting.likesCount}
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {sighting.commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
