import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword } from '../services/authService.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

function stripPassword(user: typeof users.$inferSelect) {
  const { password: _, ...rest } = user;
  return rest;
}

export async function userRoutes(app: FastifyInstance) {
  const adminOnly = [authenticate, requireRole('admin')];

  // GET /api/users
  app.get('/api/users', { preHandler: adminOnly }, async () => {
    const rows = db.select().from(users).all();
    return rows.map(stripPassword);
  });

  // POST /api/users
  app.post('/api/users', { preHandler: adminOnly }, async (request, reply) => {
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

    db.insert(users).values(newUser).run();

    return reply.code(201).send(stripPassword(newUser));
  });

  // PUT /api/users/:id
  app.put('/api/users/:id', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(users).where(eq(users.id, id)).get();

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

    db.update(users).set(updates).where(eq(users.id, id)).run();

    const updated = db.select().from(users).where(eq(users.id, id)).get();
    return stripPassword(updated!);
  });

  // DELETE /api/users/:id
  app.delete('/api/users/:id', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(users).where(eq(users.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'User not found' });
    }

    db.delete(users).where(eq(users.id, id)).run();
    return { success: true };
  });
}
