import { generateObject } from "ai";
import { createScorer, evalite } from "evalite";
import { afterAll } from "vitest";
import { z } from "zod";
import { handleQuery } from "../src/lib/ai/handle-query";
import { resolveModel } from "../src/lib/ai/provider";
import { closeDb } from "../src/lib/db/client";
import type { ProductsResult } from "../src/lib/domains/products/contract";
import type { RecipesResult } from "../src/lib/domains/recipes/contract";
import { domainTools } from "../src/lib/domains/registry.server";

// Load env before any task runs (imports above read it lazily, at call time).
process.loadEnvFile(".env.local");

afterAll(async () => {
  await closeDb();
});

type RouteOutput = { domain: string; summary: string };

/** Labeled Queries → expected Domain. "none" = clarify or plain-text Fallback. */
const DATA: { input: string; expected: string }[] = [
  { input: "a laptop under 1500 euros", expected: "products" },
  { input: "wireless noise-cancelling headphones", expected: "products" },
  { input: "a coffee maker for my kitchen", expected: "products" },
  { input: "something to buy for a weekend camping trip", expected: "products" },
  { input: "a cozy soup for a cold winter night", expected: "recipes" },
  { input: "a quick vegetarian dinner", expected: "recipes" },
  { input: "how do I make a chocolate cake", expected: "recipes" },
  { input: "a healthy high-protein breakfast", expected: "recipes" },
  { input: "chocolate", expected: "none" },
  { input: "apple", expected: "none" },
  { input: "how are you today?", expected: "none" },
  { input: "tell me a joke", expected: "none" },
];

/** Run the real Router and report which Domain it chose plus a result summary. */
async function routeQuery(input: string): Promise<RouteOutput> {
  const result = handleQuery({
    messages: [{ role: "user", content: input }],
    model: resolveModel(),
    tools: domainTools,
  });
  for await (const part of result.stream) void part; // drain (executes tools)

  const calls = await result.toolCalls;
  const text = await result.text;
  if (calls.length === 0) return { domain: "none", summary: text };

  const name = calls[0].toolName;
  const toolResults = await result.toolResults;
  const output = toolResults.find((r) => r.toolName === name)?.output;

  if (name === "searchProducts") {
    const { products } = (output as ProductsResult | undefined) ?? { products: [] };
    return {
      domain: "products",
      summary: products.slice(0, 5).map((p) => p.name).join("; ") || "(no products)",
    };
  }
  if (name === "searchRecipes") {
    const { recipes } = (output as RecipesResult | undefined) ?? { recipes: [] };
    return {
      domain: "recipes",
      summary: recipes.slice(0, 5).map((r) => r.title).join("; ") || "(no recipes)",
    };
  }
  return { domain: "none", summary: text };
}

const RoutingAccuracy = createScorer<string, RouteOutput, string>({
  name: "Routing accuracy",
  description: "Exact match: did the Router pick the expected Domain (or none)?",
  scorer: ({ output, expected }) => (output.domain === expected ? 1 : 0),
});

const Relevance = createScorer<string, RouteOutput, string>({
  name: "Relevance (LLM judge)",
  description: "LLM-as-judge rating of how relevant the response is to the request.",
  scorer: async ({ input, output }) => {
    const { object } = await generateObject({
      model: resolveModel(),
      schema: z.object({ score: z.number().min(0).max(1), reason: z.string() }),
      prompt:
        `Rate from 0 to 1 how relevant and appropriate this response is to the ` +
        `user's request.\n\nRequest: "${input}"\nResponse (domain: ${output.domain}): ` +
        `${output.summary || "(clarifying question or plain answer)"}\n\n` +
        `1 = clearly relevant and helpful; 0 = irrelevant or wrong. ` +
        `For a vague one-word request, a clarifying question is relevant.`,
    });
    return { score: object.score, metadata: { reason: object.reason } };
  },
});

evalite<string, RouteOutput, string>("Goails Router", {
  data: DATA,
  task: routeQuery,
  scorers: [RoutingAccuracy, Relevance],
});
