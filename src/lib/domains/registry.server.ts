import type { ToolSet } from "ai";
import { PRODUCTS_TOOL_NAME, productsTool } from "./products/tool";

/**
 * Server-side registry of Domain Tools the Router can call. Adding a Domain =
 * adding its Tool here (plus its contract and Surface). Server-only: the tools
 * touch the database, so never import this into client code (type-only is fine).
 */
export const domainTools = {
  [PRODUCTS_TOOL_NAME]: productsTool,
} satisfies ToolSet;
