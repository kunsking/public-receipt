import { createClient } from "@supabase/supabase-js";

import {
  getServerSupabaseConfig,
  getSupabaseSecretKey,
} from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client is server-only");
  }

  const { url } = getServerSupabaseConfig();

  return createClient(url, getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
