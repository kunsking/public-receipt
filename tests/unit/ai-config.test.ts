import { afterEach, describe, expect, it, vi } from "vitest";

import { getOpenAIConfiguration } from "@/lib/ai/config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OpenAI server configuration", () => {
  it("is unavailable unless AI is explicitly enabled", () => {
    vi.stubEnv("ENABLE_AI", "false");
    vi.stubEnv("OPENAI_API_KEY", "server-secret");
    vi.stubEnv("OPENAI_MODEL", "configured-model");

    expect(getOpenAIConfiguration()).toBeNull();
  });

  it("is unavailable when required configuration is incomplete", () => {
    vi.stubEnv("ENABLE_AI", "true");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPENAI_MODEL", "configured-model");

    expect(getOpenAIConfiguration()).toBeNull();
  });

  it("returns trimmed server-only configuration when fully enabled", () => {
    vi.stubEnv("ENABLE_AI", "true");
    vi.stubEnv("OPENAI_API_KEY", " server-secret ");
    vi.stubEnv("OPENAI_MODEL", " configured-model ");

    expect(getOpenAIConfiguration()).toEqual({
      apiKey: "server-secret",
      model: "configured-model",
    });
  });
});
