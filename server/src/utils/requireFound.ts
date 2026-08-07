import { AppError } from "./AppError.js";

// Throws a 404 if the value is null/undefined, otherwise returns it as-is.
// Saves repeating the null-check in every service.
export function requireFound<T>(doc: T | null | undefined, label: string): T {
  if (doc == null) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
  return doc;
}
