import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getRequestIp, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";
import { addPhotoSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:add-photo`, 15, 10 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many photo uploads" },
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
    const sighting = await prisma.sighting.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!sighting) {
      return jsonError("Sighting not found", 404);
    }

    const payload = addPhotoSchema.parse(await request.json());
    const photo = await prisma.sightingPhoto.create({
      data: {
        sightingId: id,
        uploaderId: localUser.id,
        imageData: payload.imageData,
        thumbnailData: payload.thumbnailData ?? payload.imageData,
        caption: payload.caption ?? null,
      },
      include: {
        uploader: true,
      },
    });

    return NextResponse.json(
      {
        id: photo.id,
        sightingId: photo.sightingId,
        uploaderId: photo.uploaderId,
        imageData: photo.imageData,
        thumbnailData: photo.thumbnailData,
        caption: photo.caption,
        createdAt: photo.createdAt.toISOString(),
        uploader: {
          id: photo.uploader.id,
          displayName: photo.uploader.displayName,
          avatarUrl: photo.uploader.avatarUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid photo payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    return jsonError("Failed to upload photo", 500);
  }
}
