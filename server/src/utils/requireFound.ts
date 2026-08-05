import { AppError } from "./AppError.js";

export function requireFound<T>(doc: T, label: string): Exclude<T, null | undefined> {
  if (doc == null) throw new AppError(`${label} not found`, 404, "NOT_FOUND");
  return doc as Exclude<T, null | undefined>;
}
