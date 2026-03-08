import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { verifyPassword } from '../services/authService.js';

export interface UserWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserWithoutPassword;
  error?: string;
}

export interface AuthStrategy {
  authenticate(email: string, password: string): Promise<AuthResult>;
}

export class LocalStrategy implements AuthStrategy {
  async authenticate(email: string, password: string): Promise<AuthResult> {
    const user = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }
}

export function getStrategy(): AuthStrategy {
  return new LocalStrategy();
}
