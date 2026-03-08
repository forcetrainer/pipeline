import type { FastifyInstance } from 'fastify';
import { eq, and, type SQL } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { prompts } from '../db/schema.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

function parsePrompt(row: typeof prompts.$inferSelect) {
  return {
    ...row,
    tags: JSON.parse(row.tags),
  };
}

export async function promptRoutes(app: FastifyInstance) {
  // GET /api/prompts
  app.get('/api/prompts', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const conditions: SQL[] = [];

    if (query.category) conditions.push(eq(prompts.category, query.category));
    if (query.aiTool) conditions.push(eq(prompts.aiTool, query.aiTool));
    if (query.approvalStatus) conditions.push(eq(prompts.approvalStatus, query.approvalStatus));

    const rows = conditions.length > 0
      ? db.select().from(prompts).where(and(...conditions)).all()
      : db.select().from(prompts).all();

    return rows.map(parsePrompt);
  });

  // GET /api/prompts/:id
  app.get('/api/prompts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = db.select().from(prompts).where(eq(prompts.id, id)).get();

    if (!row) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    return parsePrompt(row);
  });

  // POST /api/prompts
  app.post('/api/prompts', { preHandler: [authenticate] }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const newPrompt = {
      id: crypto.randomUUID(),
      title: body.title as string,
      content: body.content as string,
      description: body.description as string,
      problemBeingSolved: body.problemBeingSolved as string,
      effectivenessRating: body.effectivenessRating as number,
      tips: body.tips as string,
      category: body.category as string,
      aiTool: body.aiTool as string,
      useCaseId: (body.useCaseId as string) || null,
      tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
      submittedBy: body.submittedBy as string,
      submittedById: request.user!.userId,
      approvalStatus: (body.approvalStatus as string) || 'draft',
      reviewedBy: null,
      reviewNotes: null,
      reviewedAt: null,
      rating: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(prompts).values(newPrompt).run();

    return reply.code(201).send(parsePrompt(newPrompt));
  });

  // PUT /api/prompts/:id
  app.put('/api/prompts/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    if (existing.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to update this prompt' });
    }

    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = { updatedAt: now };
    const stringFields = ['title', 'content', 'description', 'problemBeingSolved', 'tips', 'category', 'aiTool', 'useCaseId', 'submittedBy', 'approvalStatus'] as const;

    for (const field of stringFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (body.effectivenessRating !== undefined) updates.effectivenessRating = body.effectivenessRating;
    if (body.tags !== undefined) {
      updates.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }

    db.update(prompts).set(updates).where(eq(prompts.id, id)).run();

    const updated = db.select().from(prompts).where(eq(prompts.id, id)).get();
    return parsePrompt(updated!);
  });

  // DELETE /api/prompts/:id
  app.delete('/api/prompts/:id', { preHandler: [authenticate, requirePermission('prompts:delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    db.delete(prompts).where(eq(prompts.id, id)).run();
    return { success: true };
  });

  // PUT /api/prompts/:id/review
  app.put('/api/prompts/:id/review', { preHandler: [authenticate, requirePermission('prompts:review')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    const body = request.body as { approvalStatus: string; reviewNotes?: string };
    const now = new Date().toISOString();

    db.update(prompts)
      .set({
        approvalStatus: body.approvalStatus,
        reviewedBy: request.user!.email,
        reviewNotes: body.reviewNotes || null,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(prompts.id, id))
      .run();

    const updated = db.select().from(prompts).where(eq(prompts.id, id)).get();
    return parsePrompt(updated!);
  });

  // POST /api/prompts/:id/rate
  app.post('/api/prompts/:id/rate', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = db.select().from(prompts).where(eq(prompts.id, id)).get();

    if (!existing) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    const { rating: newRating } = request.body as { rating: number };

    if (typeof newRating !== 'number' || newRating < 1 || newRating > 5) {
      return reply.code(400).send({ error: 'Rating must be a number between 1 and 5' });
    }

    const oldAvg = existing.rating;
    const oldCount = existing.ratingCount;
    const newAvg = ((oldAvg * oldCount) + newRating) / (oldCount + 1);
    const now = new Date().toISOString();

    db.update(prompts)
      .set({
        rating: newAvg,
        ratingCount: oldCount + 1,
        updatedAt: now,
      })
      .where(eq(prompts.id, id))
      .run();

    const updated = db.select().from(prompts).where(eq(prompts.id, id)).get();
    return parsePrompt(updated!);
  });
}
