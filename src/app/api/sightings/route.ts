import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { buildCursor, getPaginationFromUrl, getRequestIp, jsonError, parseCursor } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { serializeSightingSummary, sightingSummaryInclude } from "@/lib/serializers";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";
import { createSightingSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { cursor, limit } = getPaginationFromUrl(request.url);
    const parsedCursor = parseCursor(cursor);

    const sightings = await prisma.sighting.findMany({
      take: limit + 1,
      include: sightingSummaryInclude,
      where: parsedCursor
        ? {
            OR: [
              { createdAt: { lt: parsedCursor.createdAt } },
              {
                createdAt: parsedCursor.createdAt,
                id: { lt: parsedCursor.id },
              },
            ],
          }
        : undefined,
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
    return jsonError("Failed to load sightings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:create-sighting`, 10, 10 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many sighting submissions" },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfter) },
        },
      );
    }

    const { supabaseUser, appUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const localUser = appUser ?? (await syncUserFromSupabase(supabaseUser));
    const payload = createSightingSchema.parse(await request.json());

    const created = await prisma.$transaction(async (tx) => {
      const sighting = await tx.sighting.create({
        data: {
          authorId: localUser.id,
          birdName: payload.birdName,
          description: payload.description ?? null,
          date: payload.date,
          latitude: payload.latitude,
          longitude: payload.longitude,
          locationType: payload.locationType,
          radiusMeters: payload.locationType === "AREA" ? payload.radiusMeters ?? null : null,
        },
      });

      await tx.sightingPhoto.create({
        data: {
          sightingId: sighting.id,
          uploaderId: localUser.id,
          imageData: payload.imageData,
          thumbnailData: payload.thumbnailData ?? payload.imageData,
          caption: payload.caption ?? null,
        },
      });

      return sighting;
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid sighting payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    return jsonError("Failed to create sighting", 500);
  }
}
