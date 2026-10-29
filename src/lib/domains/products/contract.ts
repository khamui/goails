import { z } from "zod";

/**
 * Surface Contract for the Products Domain (ADR-0001). This Zod schema is the
 * single source of truth: it validates the Tool's output AND types the Surface
 * component's props. It is isomorphic — safe to import on server and client.
 */
export const productContract = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  priceCents: z.number().int(),
  currency: z.string(),
  tags: z.array(z.string()),
});

export const productsResultContract = z.object({
  products: z.array(productContract),
});

export type Product = z.infer<typeof productContract>;
export type ProductsResult = z.infer<typeof productsResultContract>;
