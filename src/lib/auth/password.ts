import bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password The password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 * @param password The plain text password
 * @param hashedPassword The hashed password
 * @returns True if the password matches the hash
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}