import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getRequestIp, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { serializeCommentsTree } from "@/lib/serializers";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";
import { sanitizeCommentBody } from "@/lib/utils";
import { createCommentSchema } from "@/lib/validations";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const comments = await prisma.comment.findMany({
      where: { sightingId: id },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ comments: serializeCommentsTree(comments) });
  } catch {
    return jsonError("Failed to load comments", 500);
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:create-comment`, 30, 10 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many comments" },
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
    const payload = createCommentSchema.parse(await request.json());
    const sighting = await prisma.sighting.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!sighting) {
      return jsonError("Sighting not found", 404);
    }

    if (payload.parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: payload.parentId },
        select: { sightingId: true },
      });

      if (!parent || parent.sightingId !== id) {
        return jsonError("Reply parent must belong to the same sighting", 400);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        sightingId: id,
        authorId: localUser.id,
        parentId: payload.parentId ?? null,
        body: sanitizeCommentBody(payload.body),
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(
      {
        id: comment.id,
        sightingId: comment.sightingId,
        authorId: comment.authorId,
        parentId: comment.parentId,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          displayName: comment.author.displayName,
          avatarUrl: comment.author.avatarUrl,
        },
        replies: [],
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid comment payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    return jsonError("Failed to create comment", 500);
  }
}
