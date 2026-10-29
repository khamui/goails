"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/money";
import { useCollections } from "./collections-provider";

function CartPanel() {
  const { cart, cartTotalCents, setQuantity, removeFromCart, clearCart } =
    useCollections();
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [name, setName] = useState("");

  if (stage === "done") {
    return (
      <div className="space-y-2 text-sm">
        <p className="font-medium">Order placed ✓</p>
        <p className="text-muted-foreground">
          This is a simulated checkout — no payment was taken and no order was
          submitted.
        </p>
        <Button size="sm" variant="outline" onClick={() => setStage("cart")}>
          Done
        </Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return <p className="text-sm text-muted-foreground">Your cart is empty.</p>;
  }

  if (stage === "checkout") {
    return (
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          clearCart();
          setStage("done");
        }}
      >
        <p className="text-sm text-muted-foreground">
          Total:{" "}
          <span className="font-medium text-foreground">
            {formatPrice(cartTotalCents)}
          </span>
        </p>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name on card"
          aria-label="Name on card"
          required
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={!name.trim()}>
            Pay {formatPrice(cartTotalCents)} (simulated)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setStage("cart")}
          >
            Back
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {cart.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 flex-1 truncate">{product.name}</span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                aria-label="Decrease quantity"
                onClick={() => setQuantity(product.id, quantity - 1)}
              >
                −
              </Button>
              <span className="w-5 text-center tabular-nums">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                aria-label="Increase quantity"
                onClick={() => setQuantity(product.id, quantity + 1)}
              >
                +
              </Button>
            </div>
            <span className="w-16 text-right tabular-nums">
              {formatPrice(product.priceCents * quantity, product.currency)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Remove"
              onClick={() => removeFromCart(product.id)}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{formatPrice(cartTotalCents)}</span>
      </div>
      <Button size="sm" onClick={() => setStage("checkout")}>
        Checkout
      </Button>
    </div>
  );
}

function SavedPanel() {
  const { savedRecipes, toggleSaved } = useCollections();
  if (savedRecipes.length === 0) {
    return <p className="text-sm text-muted-foreground">No saved recipes yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {savedRecipes.map((recipe) => (
        <li key={recipe.id} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 flex-1 truncate">{recipe.title}</span>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {recipe.cuisine} · {recipe.minutes} min
          </span>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Remove saved recipe"
            onClick={() => toggleSaved(recipe)}
          >
            ✕
          </Button>
        </li>
      ))}
    </ul>
  );
}

export function CollectionsBar() {
  const { cartCount, savedRecipes } = useCollections();
  const [panel, setPanel] = useState<null | "cart" | "saved">(null);

  return (
    <div className="w-full">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={panel === "cart"}
          onClick={() => setPanel((p) => (p === "cart" ? null : "cart"))}
        >
          Cart ({cartCount})
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-expanded={panel === "saved"}
          onClick={() => setPanel((p) => (p === "saved" ? null : "saved"))}
        >
          Saved ({savedRecipes.length})
        </Button>
      </div>
      {panel && (
        <div className="mt-2 rounded-lg border border-border bg-card p-4 text-card-foreground">
          {panel === "cart" ? <CartPanel /> : <SavedPanel />}
        </div>
      )}
    </div>
  );
}
