// Shared client-side input rules, kept in sync with server validators so
// users get instant feedback and the server stays the source of truth.

export const PHONE_PATTERN = "^\\+?[0-9\\s()-]{7,15}$";

export function isValidPhone(value: string): boolean {
  return new RegExp(PHONE_PATTERN).test(value);
}
