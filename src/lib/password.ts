import bcrypt from "bcryptjs";

/**
 * Hash plain password using bcrypt with salt rounds 10 (Server Node.js runtime only)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain password against stored hash (Server Node.js runtime only)
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
