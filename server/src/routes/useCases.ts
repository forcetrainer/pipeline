import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getUseCaseRepository } from '../db/repositories/index.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import type { UseCaseRow } from '../db/repositories/index.js';

function parseUseCase(row: UseCaseRow) {
  return {
    ...row,
    metrics: JSON.parse(row.metrics),
    tags: JSON.parse(row.tags),
  };
}

export async function useCaseRoutes(app: FastifyInstance) {
  const repo = getUseCaseRepository();

  // GET /api/use-cases
  app.get('/api/use-cases', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const rows = repo.findAll({
      category: query.category,
      department: query.department,
      impact: query.impact,
      status: query.status,
      aiTool: query.aiTool,
      approvalStatus: query.approvalStatus,
    });
    return rows.map(parseUseCase);
  });

  // GET /api/use-cases/:id
  app.get('/api/use-cases/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = repo.findById(id);

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

    const created = repo.create(newUseCase);
    return reply.code(201).send(parseUseCase(created));
  });

  // PUT /api/use-cases/:id
  app.put('/api/use-cases/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

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

    const updated = repo.update(id, updates);
    return parseUseCase(updated!);
  });

  // DELETE /api/use-cases/:id
  app.delete('/api/use-cases/:id', { preHandler: [authenticate, requirePermission('use-cases:delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = repo.delete(id);

    if (!deleted) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    return { success: true };
  });

  // PUT /api/use-cases/:id/review
  app.put('/api/use-cases/:id/review', { preHandler: [authenticate, requirePermission('use-cases:review')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

    if (!existing) {
      return reply.code(404).send({ error: 'Use case not found' });
    }

    const body = request.body as { approvalStatus: string; reviewNotes?: string };
    const now = new Date().toISOString();

    const updated = repo.update(id, {
      approvalStatus: body.approvalStatus,
      reviewedBy: `${request.user!.email}`,
      reviewNotes: body.reviewNotes || null,
      reviewedAt: now,
      updatedAt: now,
    });

    return parseUseCase(updated!);
  });
}
