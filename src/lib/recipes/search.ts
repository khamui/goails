import { embedText, toVectorLiteral } from "../ai/embeddings";
import { getDb } from "../db/client";

export interface RecipeMatch {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  ingredients: string[];
  steps: string[];
  minutes: number;
  tags: string[];
  /** Cosine distance to the Query (smaller = more similar). */
  distance: number;
}

/**
 * Semantic recipe retrieval: embed the Query, then return the nearest recipes
 * by cosine distance via pgvector. This is the RAG retrieval the Recipes Tool
 * (ticket #5) will call to ground its Surface.
 */
export async function searchRecipes(
  query: string,
  limit = 5,
): Promise<RecipeMatch[]> {
  const vector = toVectorLiteral(await embedText(query));
  const sql = getDb();
  const rows = await sql<RecipeMatch[]>`
    SELECT id, title, description, cuisine, ingredients, steps, minutes, tags,
           embedding <=> ${vector}::vector AS distance
    FROM recipes
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;
  return rows;
}
