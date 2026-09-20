function requireEnvironmentVariable(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getPublicSupabaseConfig() {
  return {
    url: requireEnvironmentVariable(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    publishableKey: requireEnvironmentVariable(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}

export function getServerSupabaseConfig() {
  return {
    url: requireEnvironmentVariable(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
      "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
    ),
    publishableKey: requireEnvironmentVariable(
      process.env.SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}

export function getSupabaseSecretKey(): string {
  return requireEnvironmentVariable(
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    "SUPABASE_SECRET_KEY",
  );
}
