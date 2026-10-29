import { mkdirSync, writeFileSync } from "node:fs";
import { generateObject } from "ai";
import { z } from "zod";
import { resolveModel } from "../../src/lib/ai/provider";

process.loadEnvFile(".env.local");

const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  priceCents: z.number().int().positive(),
  tags: z.array(z.string()),
});

const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cuisine: z.string(),
  ingredients: z.array(z.string()).min(2),
  steps: z.array(z.string()).min(2),
  minutes: z.number().int().positive(),
  tags: z.array(z.string()),
});

async function main() {
  const model = resolveModel();

  const { object: productResult } = await generateObject({
    model,
    schema: z.object({ products: z.array(productSchema) }),
    prompt:
      "Generate 20 diverse, realistic e-commerce products a shopper might buy: " +
      "spread across categories like electronics (incl. at least two laptops), " +
      "home, kitchen, outdoor, and audio. Give each a concrete name, a 1-2 " +
      "sentence description, a category, a price in euro cents, and a few tags.",
  });

  // Two batches keep each response well within output limits.
  const recipes: z.infer<typeof recipeSchema>[] = [];
  for (const [batch, theme] of [
    [1, "hearty, warming comfort food: soups, stews, bakes, curries, roasts"],
    [2, "lighter and varied: salads, grilled dishes, pasta, desserts, breakfasts"],
  ] as const) {
    const { object } = await generateObject({
      model,
      schema: z.object({ recipes: z.array(recipeSchema) }),
      prompt:
        `Generate 25 diverse, realistic recipes (batch ${batch}), leaning toward ${theme}. ` +
        "Vary the cuisines. Each needs a title, a 1-2 sentence description, a cuisine, " +
        "a list of ingredients, ordered steps, total minutes, and tags.",
    });
    recipes.push(...object.recipes);
  }

  mkdirSync("src/lib/db/seed-data", { recursive: true });
  writeFileSync(
    "src/lib/db/seed-data/products.json",
    JSON.stringify(productResult.products, null, 2) + "\n",
  );
  writeFileSync(
    "src/lib/db/seed-data/recipes.json",
    JSON.stringify(recipes, null, 2) + "\n",
  );
  console.log(
    `✓ generated ${productResult.products.length} products, ${recipes.length} recipes`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
