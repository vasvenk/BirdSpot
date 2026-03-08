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

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return jsonError("Comment not found", 404);
    }

    if (comment.authorId !== localUser.id) {
      return jsonError("Forbidden", 403);
    }

    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Failed to delete comment", 500);
  }
}
