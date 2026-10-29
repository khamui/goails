"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  addItem,
  cartCount,
  cartTotalCents,
  removeItem,
  setItemQuantity,
  type CartItem,
} from "@/lib/cart/cart";
import type { Product } from "@/lib/domains/products/contract";
import type { Recipe } from "@/lib/domains/recipes/contract";

interface CollectionsValue {
  cart: CartItem[];
  cartCount: number;
  cartTotalCents: number;
  addToCart: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  savedRecipes: Recipe[];
  isSaved: (recipeId: string) => boolean;
  toggleSaved: (recipe: Recipe) => void;
}

const CollectionsContext = createContext<CollectionsValue | null>(null);

/**
 * Session-scoped state for the interactive Actions: the shopping cart and saved
 * recipes. In-memory (resets on reload) — no accounts, no persistence (spec).
 */
export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saved, setSaved] = useState<Recipe[]>([]);

  const value = useMemo<CollectionsValue>(
    () => ({
      cart,
      cartCount: cartCount(cart),
      cartTotalCents: cartTotalCents(cart),
      addToCart: (product) => setCart((items) => addItem(items, product)),
      setQuantity: (id, quantity) =>
        setCart((items) => setItemQuantity(items, id, quantity)),
      removeFromCart: (id) => setCart((items) => removeItem(items, id)),
      clearCart: () => setCart([]),
      savedRecipes: saved,
      isSaved: (id) => saved.some((recipe) => recipe.id === id),
      toggleSaved: (recipe) =>
        setSaved((items) =>
          items.some((r) => r.id === recipe.id)
            ? items.filter((r) => r.id !== recipe.id)
            : [...items, recipe],
        ),
    }),
    [cart, saved],
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections(): CollectionsValue {
  const value = useContext(CollectionsContext);
  if (!value) {
    throw new Error("useCollections must be used within a CollectionsProvider");
  }
  return value;
}
