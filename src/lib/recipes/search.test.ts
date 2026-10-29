import { afterAll, describe, expect, it } from "vitest";
import { closeDb } from "../db/client";
import { searchRecipes } from "./search";

// This is an integration test: it needs a seeded Postgres + a Gemini key.
// It is skipped when DATABASE_URL is absent (e.g. CI without a database).
const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("searchRecipes — pgvector retrieval", () => {
  afterAll(async () => {
    await closeDb();
  });

  it("returns recipes ordered by ascending cosine distance", async () => {
    const results = await searchRecipes(
      "something warm and comforting for a cold rainy night",
      5,
    );
    expect(results.length).toBeGreaterThan(0);
    const distances = results.map((r) => r.distance);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("ranks the recipe corpus closer to a food query than to an unrelated one", async () => {
    // A robust semantic signal that doesn't depend on which recipes were
    // generated: a food query must match the (food) corpus better than a
    // query about laptops. If embeddings/retrieval were broken, these would
    // be indistinguishable.
    const [food] = await searchRecipes("a warm hearty dinner", 1);
    const [unrelated] = await searchRecipes(
      "a lightweight laptop for software development",
      1,
    );
    expect(food.distance).toBeLessThan(unrelated.distance);
  });
});
