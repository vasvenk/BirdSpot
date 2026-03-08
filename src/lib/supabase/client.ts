"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

function getConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key-placeholder",
  };
}

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = getConfig();
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
