import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getUserRepository } from '../db/repositories/index.js';
import type { UserRow } from '../db/repositories/index.js';
import { hashPassword } from '../services/authService.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

function stripPassword(user: UserRow) {
  const { password: _, ...rest } = user;
  return rest;
}

export async function userRoutes(app: FastifyInstance) {
  const repo = getUserRepository();

  // GET /api/users
  app.get('/api/users', { preHandler: [authenticate, requirePermission('users:read')] }, async () => {
    const rows = repo.findAll();
    return rows.map(stripPassword);
  });

  // POST /api/users
  app.post('/api/users', { preHandler: [authenticate, requirePermission('users:create')] }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const hashedPw = await hashPassword(body.password as string);

    const newUser = {
      id: crypto.randomUUID(),
      email: body.email as string,
      firstName: body.firstName as string,
      lastName: body.lastName as string,
      role: (body.role as 'user' | 'admin') || 'user',
      password: hashedPw,
      createdAt: now,
      updatedAt: now,
    };

    const created = repo.create(newUser);
    return reply.code(201).send(stripPassword(created));
  });

  // PUT /api/users/:id
  app.put('/api/users/:id', { preHandler: [authenticate, requirePermission('users:update')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

    if (!existing) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = { updatedAt: now };

    if (body.email !== undefined) updates.email = body.email;
    if (body.firstName !== undefined) updates.firstName = body.firstName;
    if (body.lastName !== undefined) updates.lastName = body.lastName;
    if (body.role !== undefined) updates.role = body.role;
    if (body.password !== undefined) {
      updates.password = await hashPassword(body.password as string);
    }

    const updated = repo.update(id, updates);
    return stripPassword(updated!);
  });

  // DELETE /api/users/:id
  app.delete('/api/users/:id', { preHandler: [authenticate, requirePermission('users:delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = repo.delete(id);

    if (!deleted) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return { success: true };
  });
}
