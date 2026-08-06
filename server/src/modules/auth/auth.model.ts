import bcrypt from "bcryptjs";

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, 12);
export const comparePassword = (candidate: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(candidate, hashed);
