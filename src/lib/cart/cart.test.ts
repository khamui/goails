import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/domains/products/contract";
import {
  addItem,
  cartCount,
  cartTotalCents,
  removeItem,
  setItemQuantity,
} from "./cart";

function product(id: string, priceCents: number): Product {
  return {
    id,
    name: `Product ${id}`,
    description: "desc",
    category: "test",
    priceCents,
    currency: "EUR",
    tags: [],
  };
}

describe("cart", () => {
  it("adds a new product as a line with quantity 1", () => {
    const items = addItem([], product("a", 1000));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("merges quantity when adding a product already in the cart", () => {
    const items = addItem(addItem([], product("a", 1000)), product("a", 1000));
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("removes the line when quantity is set to 0", () => {
    const items = setItemQuantity(addItem([], product("a", 1000)), "a", 0);
    expect(items).toHaveLength(0);
  });

  it("computes count and total across lines", () => {
    let items = addItem([], product("a", 1000), 2); // 2 × €10
    items = addItem(items, product("b", 500)); // 1 × €5
    expect(cartCount(items)).toBe(3);
    expect(cartTotalCents(items)).toBe(2500);
  });

  it("removes a line by id", () => {
    const items = removeItem(addItem([], product("a", 1000)), "a");
    expect(items).toHaveLength(0);
  });
});
