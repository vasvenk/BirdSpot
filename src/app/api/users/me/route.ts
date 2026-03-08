import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getRequestIp, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { supabaseUser, appUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const user = appUser ?? (await syncUserFromSupabase(supabaseUser));
    const sightingsCount = await prisma.sighting.count({
      where: { authorId: user.id },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        supabaseId: user.supabaseId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      sightingsCount,
    });
  } catch {
    return jsonError("Failed to load current user", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:profile-update`, 10, 15 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many profile updates" },
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
    const payload = updateProfileSchema.parse(await request.json());

    const updated = await prisma.user.update({
      where: { id: localUser.id },
      data: {
        displayName: payload.displayName ?? localUser.displayName,
        avatarUrl: payload.avatarUrl === undefined ? localUser.avatarUrl : payload.avatarUrl,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        supabaseId: updated.supabaseId,
        displayName: updated.displayName,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid profile payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    return jsonError("Failed to update current user", 500);
  }
}
