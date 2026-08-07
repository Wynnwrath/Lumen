// The Postgres column is literally `_id` (mapped in schema.prisma), but Prisma exposes
// it as `id`, so this renames it back to `_id` to match the client's API contract.
export function toApi<T>(value: T): T {
  // Primitives and Dates pass through untouched.
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => toApi(item)) as T;
  // Rebuild objects, renaming any key that's literally "id".
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key === "id" ? "_id" : key] = toApi(val);
  }
  return result as T;
}
