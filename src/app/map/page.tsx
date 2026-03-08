"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";

import { fetchJson } from "@/lib/fetcher";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { PaginatedSightingsResponse } from "@/types";

const DynamicSightingMap = dynamic(
  () => import("@/components/SightingMap").then((mod) => mod.SightingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[70vh] animate-pulse rounded-[32px] bg-[color:var(--color-moss)]/12" />
    ),
  },
);

export default function MapPage() {
  const { data, error, isLoading } = useSWR<PaginatedSightingsResponse>(
    "/api/sightings?limit=100",
    fetchJson,
  );
  const { coords, error: geolocationError } = useGeolocation();

  return (
    <div className="space-y-4 pb-30">
      <div className="space-y-2">
        <h1 className="font-[family:var(--font-display)] text-3xl text-[color:var(--color-forest)]">
          Shared map
        </h1>
        <p className="max-w-md text-sm leading-6 text-[color:var(--color-ink)]/78">
          Browse pins and approximate areas using OpenStreetMap tiles. Clusters collapse busy
          regions until you zoom in.
        </p>
        {geolocationError ? (
          <p className="text-xs text-[color:var(--color-forest)]/62">
            Couldn’t center on your current position: {geolocationError}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-[30px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Unable to load the map right now.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_14px_40px_rgba(62,86,60,0.1)]">
          {isLoading ? (
            <div className="h-[70vh] animate-pulse bg-[color:var(--color-moss)]/10" />
          ) : (
            <DynamicSightingMap
              sightings={data?.items ?? []}
              center={coords ? [coords.latitude, coords.longitude] : undefined}
              className="h-[70vh]"
            />
          )}
        </div>
      )}
    </div>
  );
}
