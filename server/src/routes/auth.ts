import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { generateToken } from '../services/authService.js';
import { getStrategy } from '../auth/strategies.js';
import { authenticate } from '../middleware/authenticate.js';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    const strategy = getStrategy();
    const result = await strategy.authenticate(email, password);

    if (!result.success || !result.user) {
      return reply.code(401).send({ error: result.error || 'Authentication failed' });
    }

    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return { token, user: result.user };
  });

  // GET /api/auth/me
  app.get('/api/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
    const user = db
      .select()
      .from(users)
      .where(eq(users.id, request.user!.userId))
      .get();

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async () => {
    return { success: true, message: 'Logged out successfully' };
  });
}
