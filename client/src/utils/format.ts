export function formatDate(iso: string | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", opts);
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string | undefined): string {
  return formatDate(iso, { month: "short", day: "numeric" });
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
