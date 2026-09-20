import "server-only";

export interface OpenAIConfiguration {
  apiKey: string;
  model: string;
}

export function getOpenAIConfiguration(): OpenAIConfiguration | null {
  if (process.env.ENABLE_AI !== "true") return null;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();
  if (!apiKey || !model) return null;

  return { apiKey, model };
}
