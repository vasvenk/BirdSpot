import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getRequestIp, jsonError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { syncUserFromSupabase, getAuthContext } from "@/lib/supabase/server";
import { syncUserSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request.headers);
    const rate = enforceRateLimit(`${ip}:sync-user`, 20, 10 * 60 * 1000);

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many sync attempts" },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfter) },
        },
      );
    }

    const { supabaseUser } = await getAuthContext();

    if (!supabaseUser) {
      return jsonError("Unauthorized", 401);
    }

    const payload = syncUserSchema.parse(await request.json().catch(() => ({})));
    const user = await syncUserFromSupabase(supabaseUser, payload);

    return NextResponse.json({
      user: {
        id: user.id,
        supabaseId: user.supabaseId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid profile payload", issues: error.flatten() },
        { status: 400 },
      );
    }

    return jsonError("Failed to sync user", 500);
  }
}
