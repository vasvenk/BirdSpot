import { createServerClient } from "@supabase/ssr";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key-placeholder",
  };
}

function getDisplayName(user: SupabaseUser, override?: string | null) {
  const seeded =
    override ??
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0];

  return String(seeded ?? "BirdSpot Birder").slice(0, 60);
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components can ignore cookie writes. Middleware handles refreshes.
        }
      },
    },
  });
}

export async function getAuthContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      supabase,
      supabaseUser: null,
      appUser: null,
    };
  }

  const appUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  return {
    supabase,
    supabaseUser: user,
    appUser,
  };
}

export async function syncUserFromSupabase(
  supabaseUser: SupabaseUser,
  values?: { displayName?: string | null; avatarUrl?: string | null },
) {
  return prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: {
      displayName: getDisplayName(supabaseUser, values?.displayName),
      avatarUrl:
        values?.avatarUrl ??
        supabaseUser.user_metadata?.avatar_url ??
        supabaseUser.user_metadata?.picture ??
        null,
    },
    create: {
      supabaseId: supabaseUser.id,
      displayName: getDisplayName(supabaseUser, values?.displayName),
      avatarUrl:
        values?.avatarUrl ??
        supabaseUser.user_metadata?.avatar_url ??
        supabaseUser.user_metadata?.picture ??
        null,
    },
  });
}
