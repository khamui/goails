import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { handleQuery } from "./handle-query";

/** A mock model that streams the given text deltas and then finishes. */
function textModel(deltas: string[]) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "text-1" },
          ...deltas.map((delta) => ({
            type: "text-delta" as const,
            id: "text-1",
            delta,
          })),
          { type: "text-end", id: "text-1" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: undefined },
            logprobs: undefined,
            usage: {
              inputTokens: {
                total: 3,
                noCache: 3,
                cacheRead: undefined,
                cacheWrite: undefined,
              },
              outputTokens: { total: 5, text: 5, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

async function collect(stream: AsyncIterable<string>) {
  let text = "";
  for await (const part of stream) text += part;
  return text;
}

describe("handleQuery — Fallback text path", () => {
  it("streams the model's text answer for a Query", async () => {
    const result = handleQuery({
      query: "how are you?",
      model: textModel(["I am ", "doing well."]),
    });

    expect(await collect(result.textStream)).toBe("I am doing well.");
  });

  it("forwards prior conversation history before the new Query", async () => {
    let receivedPrompt: unknown;
    const model = new MockLanguageModelV4({
      doStream: async (options) => {
        receivedPrompt = options.prompt;
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "text-1" },
              { type: "text-delta", id: "text-1", delta: "ok" },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: undefined },
                logprobs: undefined,
                usage: {
                  inputTokens: {
                    total: 3,
                    noCache: 3,
                    cacheRead: undefined,
                    cacheWrite: undefined,
                  },
                  outputTokens: { total: 1, text: 1, reasoning: undefined },
                },
              },
            ],
          }),
        };
      },
    });

    const result = handleQuery({
      query: "and cheaper?",
      history: [
        { role: "user", content: "a laptop under 1000" },
        { role: "assistant", content: "Here are some options." },
      ],
      model,
    });
    await collect(result.textStream);

    const serialized = JSON.stringify(receivedPrompt);
    expect(serialized).toContain("a laptop under 1000");
    expect(serialized).toContain("and cheaper?");
    expect(serialized.indexOf("a laptop under 1000")).toBeLessThan(
      serialized.lastIndexOf("and cheaper?"),
    );
  });
});
