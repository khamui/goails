import { streamText, type LanguageModel, type ModelMessage, type ToolSet } from "ai";

/**
 * System prompt for the Router. If a Domain Tool fits the request, the model
 * calls it (its result renders as a Surface). Otherwise it answers as plain
 * text — the Fallback.
 */
export const SYSTEM_PROMPT =
  "You are Goails. When the user's request fits one of your tools (for example " +
  "shopping for products), call that tool to answer. When no tool fits, answer " +
  "the user concisely in plain text. Do not describe tool results in prose; the " +
  "interface renders them.";

export interface HandleQueryInput {
  /** The conversation so far, oldest first (last entry is the new Query). */
  messages: ModelMessage[];
  /** The single injected generation model (provider-agnostic, ADR-0003). */
  model: LanguageModel;
  /** Domain Tools the Router may call. Omitted → text Fallback only. */
  tools?: ToolSet;
}

/**
 * The single server-side entry point for a Query. The model either calls a
 * Domain Tool (→ a Surface) or answers in text (→ the Fallback). One step:
 * a tool call's output is the answer, so the model is not re-invoked to
 * narrate it.
 */
export function handleQuery({ messages, model, tools }: HandleQueryInput) {
  return streamText({
    model,
    system: SYSTEM_PROMPT,
    messages,
    tools,
    onError({ error }) {
      console.error("[handleQuery] stream error:", error);
    },
  });
}
