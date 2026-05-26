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
  text: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message exceeds 10,000 character limit"),
});

export const SearchApiConfigSchema = z.object({
  id: z.string().min(1, "Search config ID is required"),
  name: z.string().min(1, "Name is required").max(60, "Name is too long"),
  provider: z.enum(["google", "searxng", "firecrawl", "custom"]),
  baseUrl: z.string().min(1, "Base URL is required"),
  apiKey: z.string().optional(),
  cx: z.string().optional(),
  maxResults: z.number().min(1).max(20),
  enabled: z.boolean(),
});

export function validateModelConfig(config: unknown) {
  return ModelConfigSchema.safeParse(config);
}

export function validateSearchConfig(config: unknown) {
  return SearchApiConfigSchema.safeParse(config);
}

export function validateApiUrl(url: string): {
  valid: boolean;
  error?: string;
} {
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

export function validateApiKey(
  key: string,
  provider?: string,
): { valid: boolean; warning?: string } {
  const localProviders = ["Ollama (Local)", "Local"];
  if (localProviders.includes(provider ?? "")) {
    return { valid: true };
  }
  if (!key || key.trim().length === 0) {
    return { valid: false, warning: "API key is required for this provider" };
  }
  return { valid: true };
}

export function validateSearchApiKey(
  key: string | undefined,
  provider: string,
): { valid: boolean; warning?: string } {
  const noKeyProviders = ["searxng", "custom"];
  if (noKeyProviders.includes(provider)) {
    return { valid: true };
  }
  if (!key || key.trim().length === 0) {
    return { valid: false, warning: "API key is required for this provider" };
  }
  return { valid: true };
}
