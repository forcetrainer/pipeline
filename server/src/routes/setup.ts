import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getUserRepository } from '../db/repositories/index.js';
import { hashPassword } from '../services/authService.js';
import { getEmailService } from '../services/emailService.js';

export async function setupRoutes(app: FastifyInstance) {
  // GET /api/setup/status — no auth required
  app.get('/api/setup/status', async () => {
    const userRepo = getUserRepository();
    const count = userRepo.count();
    return { needsSetup: count === 0 };
  });

  // POST /api/setup/init — no auth required, guarded by user count
  app.post('/api/setup/init', async (request, reply) => {
    const userRepo = getUserRepository();
    const count = userRepo.count();

    if (count > 0) {
      return reply.code(403).send({ error: 'Setup already completed' });
    }

    const body = request.body as Record<string, unknown>;

    // Validate required fields
    const email = (body.email as string || '').trim();
    const firstName = (body.firstName as string || '').trim();
    const lastName = (body.lastName as string || '').trim();
    const password = body.password as string || '';

    const errors: string[] = [];

    if (!firstName) errors.push('First name is required');
    if (!lastName) errors.push('Last name is required');
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (errors.length > 0) {
      return reply.code(400).send({ error: errors.join(', ') });
    }

    const now = new Date().toISOString();
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: crypto.randomUUID(),
      email,
      firstName,
      lastName,
      role: 'admin' as const,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    };

    const created = userRepo.create(newUser);

    // Fire-and-forget welcome email
    getEmailService().send(email, 'welcome', { firstName }).catch((err) => {
      app.log.error({ err }, 'Failed to send welcome email');
    });

    return {
      success: true,
      user: {
        id: created.id,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        role: created.role,
      },
    };
  });
}
