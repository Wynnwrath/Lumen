// Shared date/money formatting so pages don't re-implement it.

export function formatDate(iso: string | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", opts);
  } catch {
    return iso;
  }
}

// Formats a number as money with thousands separators and 2 decimals: 1234.5 -> "$1,234.50".
export function formatMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
