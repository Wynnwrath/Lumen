import bcrypt from "bcryptjs";

// Password hashing (one-way, never stored in plain text).
export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);
export const comparePassword = (candidate: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(candidate, hashed);
