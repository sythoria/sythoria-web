import { z } from "zod";

export const ModelConfigSchema = z.object({
  id: z.string().min(1, "Model ID is required"),
  name: z.string().min(1, "Name is required").max(60, "Name is too long"),
  apiBase: z
    .string()
    .min(1, "API Base URL is required")
    .refine(
      (val) => {
        try {
          const url = new URL(val);
          return ["http:", "https:"].includes(url.protocol);
        } catch {
          return false;
        }
      },
      { message: "Must be a valid HTTP or HTTPS URL" },
    ),
  apiKey: z.string(),
  modelId: z.string().min(1, "Model ID is required"),
  provider: z.string().optional(),
});

export const SendMessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty").max(10000, "Message exceeds 10,000 character limit"),
});

export function validateModelConfig(config: unknown) {
  return ModelConfigSchema.safeParse(config);
}

export function validateApiUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS protocol" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export function validateApiKey(key: string, provider?: string): { valid: boolean; warning?: string } {
  const localProviders = ["Ollama (Local)", "Local"];
  if (localProviders.includes(provider ?? "")) {
    return { valid: true };
  }
  if (!key || key.trim().length === 0) {
    return { valid: false, warning: "API key is required for this provider" };
  }
  return { valid: true };
}
