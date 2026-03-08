"use client";
/* eslint-disable @next/next/no-img-element */

import { getInitials } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

export function Avatar({ src, name, size = 44, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={className ?? "h-11 w-11 rounded-full object-cover"}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={className ?? "flex h-11 w-11 items-center justify-center rounded-full"}
      style={{ width: size, height: size }}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full bg-[color:var(--color-moss)]/20 text-sm font-semibold text-[color:var(--color-forest)]">
        {getInitials(name)}
      </span>
    </div>
  );
}
