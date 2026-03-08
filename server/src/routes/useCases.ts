import type { FastifyInstance } from 'fastify';
import { eq, and, type SQL } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { useCases } from '../db/schema.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';

function parseUseCase(row: typeof useCases.$inferSelect) {
  return {
    ...row,
    metrics: JSON.parse(row.metrics),
    tags: JSON.parse(row.tags),
  };
}

export async function useCaseRoutes(app: FastifyInstance) {
  // GET /api/use-cases
  app.get('/api/use-cases', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const conditions: SQL[] = [];

    if (query.category) conditions.push(eq(useCases.category, query.category));
    if (query.department) conditions.push(eq(useCases.department, query.department));
    if (query.impact) conditions.push(eq(useCases.impact, query.impact));
    if (query.status) conditions.push(eq(useCases.status, query.status));
    if (query.aiTool) conditions.push(eq(useCases.aiTool, query.aiTool));
    if (query.approvalStatus) conditions.push(eq(useCases.approvalStatus, query.approvalStatus));

    const rows = conditions.length > 0
      ? db.select().from(useCases).where(and(...conditions)).all()
      : db.select().from(useCases).all();

    return rows.map(parseUseCase);
  });

  // GET /api/use-cases/:id
  app.get('/api/use-cases/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(useCases).where(eq(useCases.id, id)).get();

    if (!row) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    return parseUseCase(row);
  });

  // POST /api/use-cases
  app.post('/api/use-cases', { preHandler: [authenticate] }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const newUseCase = {
      id: crypto.randomUUID(),
      title: body.title as string,
      description: body.description as string,
      whatWasBuilt: body.whatWasBuilt as string,
      keyLearnings: body.keyLearnings as string,
      metrics: typeof body.metrics === 'string' ? body.metrics : JSON.stringify(body.metrics),
      category: body.category as string,
      aiTool: body.aiTool as string,
      department: body.department as string,
      impact: body.impact as string,
      effort: body.effort as string,
      status: (body.status as string) || 'draft',
      tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
      submittedBy: body.submittedBy as string,
      submitterTeam: body.submitterTeam as string,
      submittedById: request.user!.userId,
      approvalStatus: (body.approvalStatus as string) || 'draft',
      reviewedBy: null,
      reviewNotes: null,
      reviewedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(useCases).values(newUseCase).run();

    return reply.code(201).send(parseUseCase(newUseCase));
  });

  // PUT /api/use-cases/:id
  app.put('/api/use-cases/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(useCases).where(eq(useCases.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    if (existing.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to update this use case' });
    }

    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = { updatedAt: now };
    const stringFields = ['title', 'description', 'whatWasBuilt', 'keyLearnings', 'category', 'aiTool', 'department', 'impact', 'effort', 'status', 'submittedBy', 'submitterTeam', 'approvalStatus'] as const;

    for (const field of stringFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (body.metrics !== undefined) {
      updates.metrics = typeof body.metrics === 'string' ? body.metrics : JSON.stringify(body.metrics);
    }
    if (body.tags !== undefined) {
      updates.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }

    db.update(useCases).set(updates).where(eq(useCases.id, id)).run();

    const updated = db.select().from(useCases).where(eq(useCases.id, id)).get();
    return parseUseCase(updated!);
  });

  // DELETE /api/use-cases/:id
  app.delete('/api/use-cases/:id', { preHandler: [authenticate, requireRole('admin')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(useCases).where(eq(useCases.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    db.delete(useCases).where(eq(useCases.id, id)).run();
    return { success: true };
  });

  // PUT /api/use-cases/:id/review
  app.put('/api/use-cases/:id/review', { preHandler: [authenticate, requireRole('admin')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(useCases).where(eq(useCases.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    const body = request.body as { approvalStatus: string; reviewNotes?: string };
    const now = new Date().toISOString();

    db.update(useCases)
      .set({
        approvalStatus: body.approvalStatus,
        reviewedBy: `${request.user!.email}`,
        reviewNotes: body.reviewNotes || null,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(useCases.id, id))
      .run();

    const updated = db.select().from(useCases).where(eq(useCases.id, id)).get();
    return parseUseCase(updated!);
  });
}
