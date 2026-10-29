import { simulateReadableStream, tool } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { productsResultContract } from "../domains/products/contract";
import { recipesResultContract } from "../domains/recipes/contract";
import { handleQuery } from "./handle-query";

const usage = {
  inputTokens: { total: 3, noCache: 3, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

/** A model that streams the given text deltas, then finishes. */
function textModel(deltas: string[]) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t1" },
          ...deltas.map((delta) => ({ type: "text-delta" as const, id: "t1", delta })),
          { type: "text-end", id: "t1" },
          { type: "finish", finishReason: { unified: "stop", raw: undefined }, logprobs: undefined, usage },
        ],
      }),
    }),
  });
}

/** A model that emits a single tool call for `toolName` with `input`. */
function toolCallModel(toolName: string, input: unknown) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "tool-call", toolCallId: "call-1", toolName, input: JSON.stringify(input) },
          { type: "finish", finishReason: { unified: "tool-calls", raw: undefined }, logprobs: undefined, usage },
        ],
      }),
    }),
  });
}

async function drain(result: { stream: AsyncIterable<unknown> }) {
  // consume so the stream completes and the result promises resolve
  for await (const part of result.stream) void part;
}

async function collectText(stream: AsyncIterable<string>) {
  let text = "";
  for await (const part of stream) text += part;
  return text;
}

describe("handleQuery", () => {
  it("streams a plain-text answer when no tool fits (Fallback)", async () => {
    const result = handleQuery({
      messages: [{ role: "user", content: "how are you?" }],
      model: textModel(["I am ", "doing well."]),
    });
    expect(await collectText(result.textStream)).toBe("I am doing well.");
  });

  it("forwards the whole conversation to the model", async () => {
    let receivedPrompt: unknown;
    const model = new MockLanguageModelV4({
      doStream: async (options) => {
        receivedPrompt = options.prompt;
        return {
          stream: simulateReadableStream({
            chunks: [
              { type: "text-start", id: "t1" },
              { type: "text-delta", id: "t1", delta: "ok" },
              { type: "text-end", id: "t1" },
              { type: "finish", finishReason: { unified: "stop", raw: undefined }, logprobs: undefined, usage },
            ],
          }),
        };
      },
    });

    const result = handleQuery({
      messages: [
        { role: "user", content: "a laptop under 1000" },
        { role: "assistant", content: "Here are some options." },
        { role: "user", content: "and cheaper?" },
      ],
      model,
    });
    await collectText(result.textStream);

    const serialized = JSON.stringify(receivedPrompt);
    expect(serialized).toContain("a laptop under 1000");
    expect(serialized).toContain("and cheaper?");
    expect(serialized.indexOf("a laptop under 1000")).toBeLessThan(
      serialized.lastIndexOf("and cheaper?"),
    );
  });

  it("routes a product query to the products Tool and yields contract-valid output", async () => {
    const stubProductsTool = tool({
      description: "stub product search",
      inputSchema: z.object({
        text: z.string().optional(),
        maxPriceCents: z.number().int().positive().optional(),
      }),
      execute: async () =>
        productsResultContract.parse({
          products: [
            {
              id: "p1",
              name: "Test Laptop",
              description: "A test laptop.",
              category: "electronics",
              priceCents: 90000,
              currency: "EUR",
              tags: ["laptop"],
            },
          ],
        }),
    });

    const result = handleQuery({
      messages: [{ role: "user", content: "a laptop under 1000" }],
      model: toolCallModel("searchProducts", { text: "laptop", maxPriceCents: 100000 }),
      tools: { searchProducts: stubProductsTool },
    });
    await drain(result);

    const toolResults = await result.toolResults;
    const searchResult = toolResults.find((r) => r.toolName === "searchProducts");
    expect(searchResult).toBeDefined();
    const parsed = productsResultContract.safeParse(searchResult?.output);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.products[0].name).toBe("Test Laptop");
  });

  it("routes a recipe query to the recipes Tool and yields contract-valid output", async () => {
    const stubRecipesTool = tool({
      description: "stub recipe search",
      inputSchema: z.object({ query: z.string() }),
      execute: async () =>
        recipesResultContract.parse({
          recipes: [
            {
              id: "r1",
              title: "Hearty Beef Stew",
              description: "A warming stew.",
              cuisine: "British",
              ingredients: ["beef", "carrots"],
              steps: ["Brown the beef.", "Simmer with vegetables."],
              minutes: 90,
              tags: ["warm", "comfort"],
            },
          ],
        }),
    });

    const result = handleQuery({
      messages: [{ role: "user", content: "something warm for a rainy night" }],
      model: toolCallModel("searchRecipes", { query: "something warm for a rainy night" }),
      tools: { searchRecipes: stubRecipesTool },
    });
    await drain(result);

    const toolResults = await result.toolResults;
    const searchResult = toolResults.find((r) => r.toolName === "searchRecipes");
    expect(searchResult).toBeDefined();
    const parsed = recipesResultContract.safeParse(searchResult?.output);
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.recipes[0].title).toBe("Hearty Beef Stew");
  });

  it("re-routes a refinement turn to the tool with the updated constraint", async () => {
    const stubProductsTool = tool({
      description: "stub product search",
      inputSchema: z.object({
        text: z.string().optional(),
        maxPriceCents: z.number().int().positive().optional(),
      }),
      execute: async () => productsResultContract.parse({ products: [] }),
    });

    const result = handleQuery({
      messages: [
        { role: "user", content: "a laptop" },
        { role: "assistant", content: "Here are some laptops." },
        { role: "user", content: "cheaper, under 800" },
      ],
      model: toolCallModel("searchProducts", { text: "laptop", maxPriceCents: 80000 }),
      tools: { searchProducts: stubProductsTool },
    });
    await drain(result);

    const call = (await result.toolCalls).find((c) => c.toolName === "searchProducts");
    expect(call).toBeDefined();
    expect((call?.input as { maxPriceCents?: number }).maxPriceCents).toBe(80000);
  });

  it("asks a clarifying question in text (no tool call) when a query is ambiguous", async () => {
    const stub = tool({
      description: "stub",
      inputSchema: z.object({ text: z.string().optional(), query: z.string().optional() }),
      execute: async () => ({}),
    });

    const result = handleQuery({
      messages: [{ role: "user", content: "apple" }],
      model: textModel(["Do you mean ", "Apple products or apple recipes?"]),
      tools: { searchProducts: stub, searchRecipes: stub },
    });

    expect(await collectText(result.textStream)).toContain("Apple products or apple recipes");
    expect((await result.toolCalls).length).toBe(0);
  });
});
