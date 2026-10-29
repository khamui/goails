import type { Product } from "@/lib/domains/products/contract";

export interface CartItem {
  product: Product;
  quantity: number;
}

/** Add a product, merging quantity if it's already in the cart. */
export function addItem(items: CartItem[], product: Product, quantity = 1): CartItem[] {
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) {
    return items.map((item) =>
      item.product.id === product.id
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  }
  return [...items, { product, quantity }];
}

/** Set a line's quantity; a quantity of 0 or less removes the line. */
export function setItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.product.id !== productId);
  return items.map((item) =>
    item.product.id === productId ? { ...item, quantity } : item,
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.product.id !== productId);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartTotalCents(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  );
}
