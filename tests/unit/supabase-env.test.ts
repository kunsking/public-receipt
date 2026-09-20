import { afterEach, describe, expect, it } from "vitest";

import {
  getPublicSupabaseConfig,
  getServerSupabaseConfig,
  getSupabaseSecretKey,
} from "@/lib/supabase/env";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("Supabase environment configuration", () => {
  it("keeps the browser client on NEXT_PUBLIC variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.example.test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";

    expect(getPublicSupabaseConfig()).toEqual({
      url: "https://public.example.test",
      publishableKey: "public-key",
    });
  });

  it("prefers server-only URL and publishable-key variables on the server", () => {
    process.env.SUPABASE_URL = "https://server.example.test";
    process.env.SUPABASE_PUBLISHABLE_KEY = "server-public-key";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.example.test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";

    expect(getServerSupabaseConfig()).toEqual({
      url: "https://server.example.test",
      publishableKey: "server-public-key",
    });
  });

  it("supports NEXT_PUBLIC fallbacks for server reads", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.example.test";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";

    expect(getServerSupabaseConfig()).toEqual({
      url: "https://public.example.test",
      publishableKey: "public-key",
    });
  });

  it("prefers the current server-only secret-key convention", () => {
    process.env.SUPABASE_SECRET_KEY = "current-secret";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy-secret";

    expect(getSupabaseSecretKey()).toBe("current-secret");
  });

  it("retains a migration fallback for legacy service-role configurations", () => {
    delete process.env.SUPABASE_SECRET_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "legacy-secret";

    expect(getSupabaseSecretKey()).toBe("legacy-secret");
  });
});
