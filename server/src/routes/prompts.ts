import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getPromptRepository, getPromptStarRepository, getPromptCommentRepository } from '../db/repositories/index.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import type { PromptRow } from '../db/repositories/index.js';

function parsePrompt(row: PromptRow) {
  return {
    ...row,
    tags: JSON.parse(row.tags),
  };
}

export async function promptRoutes(app: FastifyInstance) {
  const repo = getPromptRepository();
  const starRepo = getPromptStarRepository();
  const commentRepo = getPromptCommentRepository();

  // GET /api/prompts
  app.get('/api/prompts', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const rows = repo.findAll({
      category: query.category,
      aiTool: query.aiTool,
      approvalStatus: query.approvalStatus,
    });
    return rows.map(parsePrompt);
  });

  // GET /api/prompts/starred (must be before /:id to avoid matching "starred" as an id)
  app.get('/api/prompts/starred', { preHandler: [authenticate] }, async (request) => {
    const stars = starRepo.findByUser(request.user!.userId);
    const promptIds = stars.map(s => s.promptId);
    const allPrompts = repo.findAll();
    return allPrompts.filter(p => promptIds.includes(p.id)).map(parsePrompt);
  });

  // GET /api/prompts/:id
  app.get('/api/prompts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = repo.findById(id);

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

    const created = repo.create(newPrompt);
    return reply.code(201).send(parsePrompt(created));
  });

  // PUT /api/prompts/:id
  app.put('/api/prompts/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

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

    const updated = repo.update(id, updates);
    return parsePrompt(updated!);
  });

  // DELETE /api/prompts/:id
  app.delete('/api/prompts/:id', { preHandler: [authenticate, requirePermission('prompts:delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = repo.delete(id);

    if (!deleted) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    return { success: true };
  });

  // PUT /api/prompts/:id/review
  app.put('/api/prompts/:id/review', { preHandler: [authenticate, requirePermission('prompts:review')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

    if (!existing) {
      return reply.code(404).send({ error: 'Prompt not found' });
    }

    const body = request.body as { approvalStatus: string; reviewNotes?: string };
    const now = new Date().toISOString();

    const updated = repo.update(id, {
      approvalStatus: body.approvalStatus,
      reviewedBy: request.user!.email,
      reviewNotes: body.reviewNotes || null,
      reviewedAt: now,
      updatedAt: now,
    });

    return parsePrompt(updated!);
  });

  // POST /api/prompts/:id/rate
  app.post('/api/prompts/:id/rate', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = repo.findById(id);

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

    const updated = repo.update(id, {
      rating: newAvg,
      ratingCount: oldCount + 1,
      updatedAt: now,
    });

    return parsePrompt(updated!);
  });

  // POST /api/prompts/:id/star (toggle star)
  app.post('/api/prompts/:id/star', { preHandler: [authenticate, requirePermission('prompts:star')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const prompt = repo.findById(id);
    if (!prompt) return reply.code(404).send({ error: 'Prompt not found' });

    const existing = starRepo.findByPromptAndUser(id, request.user!.userId);
    if (existing) {
      starRepo.delete(id, request.user!.userId);
      const count = starRepo.countByPrompt(id);
      repo.update(id, { starCount: count });
      return { starred: false, starCount: count };
    } else {
      starRepo.create({ id: crypto.randomUUID(), promptId: id, userId: request.user!.userId, createdAt: new Date().toISOString() });
      const count = starRepo.countByPrompt(id);
      repo.update(id, { starCount: count });
      return { starred: true, starCount: count };
    }
  });

  // GET /api/prompts/:id/star (check if current user starred)
  app.get('/api/prompts/:id/star', { preHandler: [authenticate] }, async (request) => {
    const { id } = request.params as { id: string };
    const existing = starRepo.findByPromptAndUser(id, request.user!.userId);
    return { starred: !!existing };
  });

  // GET /api/prompts/:id/comments
  app.get('/api/prompts/:id/comments', async (request) => {
    const { id } = request.params as { id: string };
    const comments = commentRepo.findByPrompt(id);
    return comments;
  });

  // POST /api/prompts/:id/comments
  app.post('/api/prompts/:id/comments', { preHandler: [authenticate, requirePermission('prompts:comment')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const prompt = repo.findById(id);
    if (!prompt) return reply.code(404).send({ error: 'Prompt not found' });

    const body = request.body as { content: string; parentId?: string };
    if (!body.content || body.content.length > 5000) {
      return reply.code(400).send({ error: 'Content is required and must be under 5000 characters' });
    }

    // If parentId provided, verify it exists and is a top-level comment (single-level threading)
    if (body.parentId) {
      const parent = commentRepo.findById(body.parentId);
      if (!parent) return reply.code(400).send({ error: 'Parent comment not found' });
      if (parent.parentId) return reply.code(400).send({ error: 'Cannot reply to a reply (single-level threading only)' });
    }

    const now = new Date().toISOString();
    const comment = commentRepo.create({
      id: crypto.randomUUID(),
      promptId: id,
      userId: request.user!.userId,
      parentId: body.parentId || null,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    });

    // Update cached count
    const count = commentRepo.countByPrompt(id);
    repo.update(id, { commentCount: count });

    return reply.code(201).send(comment);
  });

  // PUT /api/prompts/:id/comments/:commentId
  app.put('/api/prompts/:id/comments/:commentId', { preHandler: [authenticate, requirePermission('prompts:comment')] }, async (request, reply) => {
    const { commentId } = request.params as { id: string; commentId: string };
    const existing = commentRepo.findById(commentId);
    if (!existing) return reply.code(404).send({ error: 'Comment not found' });

    // Owner or admin can edit
    if (existing.userId !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to edit this comment' });
    }

    const body = request.body as { content: string };
    if (!body.content || body.content.length > 5000) {
      return reply.code(400).send({ error: 'Content is required and must be under 5000 characters' });
    }

    const updated = commentRepo.update(commentId, { content: body.content, updatedAt: new Date().toISOString() });
    return updated;
  });

  // DELETE /api/prompts/:id/comments/:commentId
  app.delete('/api/prompts/:id/comments/:commentId', { preHandler: [authenticate] }, async (request, reply) => {
    const { id, commentId } = request.params as { id: string; commentId: string };
    const existing = commentRepo.findById(commentId);
    if (!existing) return reply.code(404).send({ error: 'Comment not found' });

    // Admin can delete any, regular user can only delete their own
    if (request.user!.role !== 'admin' && existing.userId !== request.user!.userId) {
      return reply.code(403).send({ error: 'Not authorized to delete this comment' });
    }

    commentRepo.delete(commentId);

    // Update cached count
    const count = commentRepo.countByPrompt(id);
    repo.update(id, { commentCount: count });

    return { success: true };
  });
}
