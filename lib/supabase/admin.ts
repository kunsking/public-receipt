import { createClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig, getServiceRoleKey } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client is server-only");
  }

  const { url } = getPublicSupabaseConfig();

  return createClient(url, getServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
