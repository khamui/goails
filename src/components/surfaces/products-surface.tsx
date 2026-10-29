"use client";

import { Button } from "@/components/ui/button";
import type { ProductsResult } from "@/lib/domains/products/contract";

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/** The Products Surface: renders buyable product cards from the contract. */
export function ProductsSurface({ products }: ProductsResult) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No matching products.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col gap-2 rounded-lg border border-border p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight">{product.name}</h3>
            <span className="whitespace-nowrap text-sm font-semibold">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {product.description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="text-xs text-muted-foreground">
              {product.category}
            </span>
            {/* Cart/checkout Action is implemented in ticket #8. */}
            <Button size="sm" type="button">
              Add to cart
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
