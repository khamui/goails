import { readFileSync } from "node:fs";
import { embedTexts, toVectorLiteral } from "../../src/lib/ai/embeddings";
import { closeDb, getDb } from "../../src/lib/db/client";

process.loadEnvFile(".env.local");

interface SeedProduct {
  name: string;
  description: string;
  category: string;
  priceCents: number;
  currency?: string;
  tags: string[];
}
interface SeedRecipe {
  title: string;
  description: string;
  cuisine: string;
  ingredients: string[];
  steps: string[];
  minutes: number;
  tags: string[];
}

function id(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `${base}-${index}`;
}

function read<T>(file: string): T {
  return JSON.parse(readFileSync(`src/lib/db/seed-data/${file}`, "utf8")) as T;
}

async function main() {
  const products = read<SeedProduct[]>("products.json");
  const recipes = read<SeedRecipe[]>("recipes.json");
  const sql = getDb();

  await sql`TRUNCATE products, recipes`;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await sql`
      INSERT INTO products (id, name, description, category, price_cents, currency, tags)
      VALUES (${id(p.name, i)}, ${p.name}, ${p.description}, ${p.category},
              ${p.priceCents}, ${p.currency ?? "EUR"}, ${p.tags})
    `;
  }

  // Embed recipes for semantic retrieval, then insert with their vectors.
  const texts = recipes.map(
    (r) =>
      `${r.title}. ${r.description}. Cuisine: ${r.cuisine}. ` +
      `Ingredients: ${r.ingredients.join(", ")}. ${r.tags.join(" ")}`,
  );
  const vectors = await embedTexts(texts);

  for (let i = 0; i < recipes.length; i++) {
    const r = recipes[i];
    await sql`
      INSERT INTO recipes (id, title, description, cuisine, ingredients, steps, minutes, tags, embedding)
      VALUES (${id(r.title, i)}, ${r.title}, ${r.description}, ${r.cuisine},
              ${r.ingredients}, ${r.steps}, ${r.minutes}, ${r.tags},
              ${toVectorLiteral(vectors[i])}::vector)
    `;
  }

  console.log(`✓ seeded ${products.length} products, ${recipes.length} recipes`);
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
