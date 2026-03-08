"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import type { SightingPhoto } from "@/types";

export function PhotoCarousel({ photos }: { photos: SightingPhoto[] }) {
  const [index, setIndex] = useState(0);

  if (!photos.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-[color:var(--color-moss)]/40 bg-white/50 p-6 text-center text-sm text-[color:var(--color-forest)]/70">
        No photos have been added yet.
      </div>
    );
  }

  const photo = photos[index];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[30px] bg-[color:var(--color-moss)]/12">
        <img
          src={photo.imageData}
          alt={photo.caption ?? `Bird sighting photo ${index + 1}`}
          className="aspect-[4/3] w-full object-cover"
        />

        {photos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIndex((current) => (current === 0 ? photos.length - 1 : current - 1))}
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((current) => (current === photos.length - 1 ? 0 : current + 1))}
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={photo.uploader.avatarUrl} name={photo.uploader.displayName} size={36} />
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-forest)]">
              {photo.uploader.displayName}
            </p>
            {photo.caption ? (
              <p className="text-sm text-[color:var(--color-ink)]/75">{photo.caption}</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          {photos.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-label={`View photo ${dotIndex + 1}`}
              className={
                dotIndex === index
                  ? "h-2.5 w-6 rounded-full bg-[color:var(--color-forest)]"
                  : "h-2.5 w-2.5 rounded-full bg-[color:var(--color-forest)]/20"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
