import { streamText, type LanguageModel, type ModelMessage } from "ai";

/**
 * System prompt for the Fallback text path. With no Domains registered yet,
 * every Query is answered as plain text rather than routed to a Surface.
 */
export const FALLBACK_SYSTEM_PROMPT =
  "You are Goails, a helpful assistant. Answer the user concisely in plain text.";

export interface HandleQueryInput {
  /** The user's natural-language request. */
  query: string;
  /** Prior turns in the conversation, oldest first. Enables refinement. */
  history?: ModelMessage[];
  /** The single injected generation model (provider-agnostic). */
  model: LanguageModel;
}

/**
 * The single server-side entry point for a Query. For now it streams a plain
 * text answer (the Fallback); Domain routing and Surfaces arrive in later work.
 */
export function handleQuery({ query, history = [], model }: HandleQueryInput) {
  return streamText({
    model,
    system: FALLBACK_SYSTEM_PROMPT,
    messages: [...history, { role: "user", content: query }],
  });
}
