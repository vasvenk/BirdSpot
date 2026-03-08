import { NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializeSightingDetail, sightingDetailInclude } from "@/lib/serializers";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const auth = await getAuthContext();
    const viewer = auth.supabaseUser
      ? auth.appUser ?? (await syncUserFromSupabase(auth.supabaseUser))
      : null;

    const sighting = await prisma.sighting.findUnique({
      where: { id },
      include: sightingDetailInclude,
    });

    if (!sighting) {
      return jsonError("Sighting not found", 404);
    }

    const likedByViewer = viewer
      ? Boolean(
          await prisma.like.findUnique({
            where: {
              userId_sightingId: {
                userId: viewer.id,
                sightingId: id,
              },
            },
          }),
        )
      : false;

    return NextResponse.json(serializeSightingDetail(sighting, likedByViewer));
  } catch {
    return jsonError("Failed to load sighting", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUser, appUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const localUser = appUser ?? (await syncUserFromSupabase(supabaseUser));

    const sighting = await prisma.sighting.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!sighting) {
      return jsonError("Sighting not found", 404);
    }

    if (sighting.authorId !== localUser.id) {
      return jsonError("Forbidden", 403);
    }

    await prisma.sighting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Failed to delete sighting", 500);
  }
}
