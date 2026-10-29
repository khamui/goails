/** Format integer cents as a localized currency string (e.g. 129900 → €1,299.00). */
export function formatPrice(cents: number, currency = "EUR"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
