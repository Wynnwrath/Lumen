// Renames every `id` key to `_id` recursively before sending data to the client.
// The app used MongoDB where the key was `_id`; after moving to Postgres/Prisma
// the field is `id`, and this keeps the frontend (which still expects `_id`) working.
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
