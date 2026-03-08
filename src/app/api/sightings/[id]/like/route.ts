import { NextRequest, NextResponse } from "next/server";

import { getRequestIp, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUser, appUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const localUser = appUser ?? (await syncUserFromSupabase(supabaseUser));
    const like = await prisma.like.findUnique({
      where: {
        userId_sightingId: {
          userId: localUser.id,
          sightingId: id,
        },
      },
    });

    return NextResponse.json({ liked: Boolean(like) });
  } catch {
    return jsonError("Failed to check like status", 500);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:toggle-like`, 80, 5 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many like actions" },
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
    const result = await prisma.$transaction(async (tx) => {
      const sighting = await tx.sighting.findUnique({
        where: { id },
        select: { id: true, likesCount: true },
      });

      if (!sighting) {
        throw new Error("NOT_FOUND");
      }

      const existing = await tx.like.findUnique({
        where: {
          userId_sightingId: {
            userId: localUser.id,
            sightingId: id,
          },
        },
      });

      if (existing) {
        await tx.like.delete({
          where: {
            userId_sightingId: {
              userId: localUser.id,
              sightingId: id,
            },
          },
        });

        const updated = await tx.sighting.update({
          where: { id },
          data: {
            likesCount: {
              decrement: 1,
            },
          },
          select: { likesCount: true },
        });

        return {
          liked: false,
          likesCount: Math.max(updated.likesCount, 0),
        };
      }

      await tx.like.create({
        data: {
          userId: localUser.id,
          sightingId: id,
        },
      });

      const updated = await tx.sighting.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
        select: { likesCount: true },
      });

      return {
        liked: true,
        likesCount: updated.likesCount,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return jsonError("Sighting not found", 404);
    }

    return jsonError("Failed to update like", 500);
  }
}
