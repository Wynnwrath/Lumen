export function toApi<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => toApi(item)) as T;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key === "id" ? "_id" : key] = toApi(val);
  }
  return result as T;
}
