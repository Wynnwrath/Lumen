// Shared date/money formatting so pages don't re-implement it.

export function formatDate(iso: string | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", opts);
  } catch {
    return iso;
  }
}
