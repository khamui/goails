import { tool } from "ai";
import { z } from "zod";
import { getDb } from "../../db/client";
import { type ProductsResult, productsResultContract } from "./contract";

/** The tool name the Router calls; the client renders `tool-searchProducts`. */
export const PRODUCTS_TOOL_NAME = "searchProducts";

/**
 * The Products Tool: the model calls this when the user wants to find/buy
 * products. It filters the catalog and returns contract-valid data, which the
 * Products Surface renders. Server-only (it touches the database).
 */
export const productsTool = tool({
  description:
    "Search the product catalog when the user wants to find or buy products " +
    "(electronics, home, kitchen, outdoor, audio, and similar). Derive any " +
    "price or category constraints from the request.",
  inputSchema: z.object({
    text: z
      .string()
      .optional()
      .describe("free-text search terms, e.g. 'laptop' or 'headphones'"),
    category: z.string().optional().describe("a product category to filter by"),
    maxPriceCents: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("maximum price in euro cents"),
    minPriceCents: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("minimum price in euro cents"),
  }),
  execute: async ({
    text,
    category,
    maxPriceCents,
    minPriceCents,
  }): Promise<ProductsResult> => {
    const sql = getDb();
    const like = text ? `%${text}%` : null;
    const categoryLike = category ? `%${category}%` : null;
    const rows = await sql`
      SELECT id, name, description, category,
             price_cents AS "priceCents", currency, tags
      FROM products
      WHERE (${like}::text IS NULL
             OR name ILIKE ${like} OR description ILIKE ${like})
        AND (${categoryLike}::text IS NULL OR category ILIKE ${categoryLike})
        AND (${maxPriceCents ?? null}::int IS NULL OR price_cents <= ${maxPriceCents ?? null})
        AND (${minPriceCents ?? null}::int IS NULL OR price_cents >= ${minPriceCents ?? null})
      ORDER BY price_cents ASC
      LIMIT 12
    `;
    return productsResultContract.parse({ products: rows });
  },
});
