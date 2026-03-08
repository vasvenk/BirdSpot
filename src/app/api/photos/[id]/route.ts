import { NextRequest, NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getAuthContext, syncUserFromSupabase } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUser, appUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const localUser = appUser ?? (await syncUserFromSupabase(supabaseUser));

    const photo = await prisma.sightingPhoto.findUnique({
      where: { id },
      select: { uploaderId: true },
    });

    if (!photo) {
      return jsonError("Photo not found", 404);
    }

    if (photo.uploaderId !== localUser.id) {
      return jsonError("Forbidden", 403);
    }

    await prisma.sightingPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Failed to delete photo", 500);
  }
}
