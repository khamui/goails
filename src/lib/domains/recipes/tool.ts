import { tool } from "ai";
import { z } from "zod";
import { searchRecipes } from "../../recipes/search";
import { type RecipesResult, recipesResultContract } from "./contract";

/** The tool name the Router calls; the client renders `tool-searchRecipes`. */
export const RECIPES_TOOL_NAME = "searchRecipes";

/**
 * The Recipes Tool: RAG retrieval. The model calls this when the user wants
 * something to cook or eat; `searchRecipes` embeds the intent and returns the
 * nearest recipes by cosine distance. Server-only (embeddings + database).
 */
export const recipesTool = tool({
  description:
    "Find recipes by meaning when the user wants something to cook or eat — " +
    "by mood, craving, ingredients, cuisine, dietary need, or occasion. Pass " +
    "the user's full intent as `query`.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("what the user feels like cooking or eating, in their words"),
  }),
  execute: async ({ query }): Promise<RecipesResult> => {
    const matches = await searchRecipes(query, 6);
    // The contract has no `distance`, so parse() strips that retrieval metadata.
    return recipesResultContract.parse({ recipes: matches });
  },
});
