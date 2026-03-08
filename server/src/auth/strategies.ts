import { getUserRepository } from '../db/repositories/index.js';
import { verifyPassword } from '../services/authService.js';
import { SSOStrategy, type AuthMode } from './sso.js';

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
    const userRepo = getUserRepository();
    const user = userRepo.findByEmail(email);

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
  const authMode = (process.env.AUTH_MODE || 'local') as AuthMode;
  switch (authMode) {
    case 'sso':
      return new SSOStrategy();
    case 'hybrid':
      // In hybrid mode, try local first (for admin/service accounts)
      return new LocalStrategy();
    case 'local':
    default:
      return new LocalStrategy();
  }
}
