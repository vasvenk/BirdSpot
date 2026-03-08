"use client";

import useSWRInfinite from "swr/infinite";

import { fetchJson } from "@/lib/fetcher";
import type { PaginatedSightingsResponse, SightingSummary } from "@/types";

type UseSightingsOptions = {
  endpoint?: string | null;
  limit?: number;
};

export function useSightings(options: UseSightingsOptions = {}) {
  const endpoint = options.endpoint ?? "/api/sightings";
  const limit = options.limit ?? 10;

  const swr = useSWRInfinite<PaginatedSightingsResponse>(
    (pageIndex, previousPageData) => {
      if (!endpoint) {
        return null;
      }

      if (previousPageData && !previousPageData.nextCursor) {
        return null;
      }

      const cursor =
        pageIndex === 0 ? "" : `&cursor=${encodeURIComponent(previousPageData?.nextCursor ?? "")}`;

      return `${endpoint}?limit=${limit}${cursor}`;
    },
    (key: string) => fetchJson<PaginatedSightingsResponse>(key),
    {
      revalidateFirstPage: false,
    },
  );

  const items: SightingSummary[] = swr.data?.flatMap((page) => page.items) ?? [];
  const hasMore = Boolean(swr.data?.[swr.data.length - 1]?.nextCursor);
  const isLoadingInitialData = !swr.data && !swr.error;
  const isLoadingMore = swr.isLoading || (swr.size > 0 && swr.data?.[swr.size - 1] === undefined);

  return {
    ...swr,
    items,
    hasMore,
    isLoadingInitialData,
    isLoadingMore,
  };
}
