import { NextRequest, NextResponse } from "next/server";

import { buildCursor, getPaginationFromUrl, jsonError, parseCursor } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeSightingSummary, sightingSummaryInclude } from "@/lib/serializers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { cursor, limit } = getPaginationFromUrl(request.url);
    const parsedCursor = parseCursor(cursor);

    const sightings = await prisma.sighting.findMany({
      take: limit + 1,
      include: sightingSummaryInclude,
      where: {
        authorId: id,
        ...(parsedCursor
          ? {
              OR: [
                { createdAt: { lt: parsedCursor.createdAt } },
                {
                  createdAt: parsedCursor.createdAt,
                  id: { lt: parsedCursor.id },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const hasMore = sightings.length > limit;
    const pageItems = hasMore ? sightings.slice(0, limit) : sightings;
    const next = hasMore ? pageItems[pageItems.length - 1] : null;

    return NextResponse.json({
      items: pageItems.map(serializeSightingSummary),
      nextCursor: next ? buildCursor(next.createdAt, next.id) : null,
    });
  } catch {
    return jsonError("Failed to load user sightings", 500);
  }
}
