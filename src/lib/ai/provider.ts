import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

/**
 * Supported generation providers. Per ADR-0003 the model is provider-agnostic:
 * switching the generation/routing model is a config change, not a code change.
 */
export type ModelProvider = "google" | "anthropic";

/** Default free-tier/default model id per provider. */
const DEFAULT_MODEL_ID: Record<ModelProvider, string> = {
  google: "gemini-2.5-flash", // free tier, no credit card
  anthropic: "claude-sonnet-5-5", // swappable; billed to a Claude API key
};

function isProvider(value: string): value is ModelProvider {
  return value === "google" || value === "anthropic";
}

/**
 * Resolve the generation model from configuration.
 *
 * - `GOAILS_MODEL_PROVIDER` selects the provider (default: `google`).
 * - `GOAILS_MODEL_ID` overrides the model id (default: per-provider above).
 */
export function resolveModel(): LanguageModel {
  const provider = process.env.GOAILS_MODEL_PROVIDER ?? "google";
  if (!isProvider(provider)) {
    throw new Error(
      `Unknown GOAILS_MODEL_PROVIDER "${provider}". Expected "google" or "anthropic".`,
    );
  }

  const modelId = process.env.GOAILS_MODEL_ID ?? DEFAULT_MODEL_ID[provider];
  return provider === "google" ? google(modelId) : anthropic(modelId);
}
