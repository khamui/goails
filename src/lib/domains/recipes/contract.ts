import { z } from "zod";

/**
 * Surface Contract for the Recipes Domain (ADR-0001). Isomorphic: validates the
 * Tool's output and types the Recipes Surface. Retrieval distance is internal
 * to search and deliberately excluded from the displayed shape.
 */
export const recipeContract = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  cuisine: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  minutes: z.number().int(),
  tags: z.array(z.string()),
});

export const recipesResultContract = z.object({
  recipes: z.array(recipeContract),
});

export type Recipe = z.infer<typeof recipeContract>;
export type RecipesResult = z.infer<typeof recipesResultContract>;
