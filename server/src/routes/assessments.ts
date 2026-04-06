import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getAssessmentRepository, getAssessmentCheckpointRepository, getUseCaseRepository, getUserRepository } from '../db/repositories/index.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';
import { getEmailService } from '../services/emailService.js';
import type { AssessmentRow } from '../db/repositories/index.js';

/**
 * Calculate full UseCaseMetrics projections from assessment input fields.
 * Mirrors the logic in src/utils/metricsCalculator.ts so promote-to-use-case
 * produces a valid metrics object.
 */
function calculateMetricsFromEstimates(est: {
  timeSavedPerUseMinutes: number;
  moneySavedPerUse: number;
  revenuePerUse: number;
  numberOfUsers: number;
  usesPerUserPerPeriod: number;
  frequencyPeriod: string;
}) {
  const {
    timeSavedPerUseMinutes, moneySavedPerUse, revenuePerUse,
    numberOfUsers, usesPerUserPerPeriod, frequencyPeriod,
  } = est;

  let totalUsesPerDay: number;
  if (frequencyPeriod === 'daily') {
    totalUsesPerDay = numberOfUsers * usesPerUserPerPeriod;
  } else if (frequencyPeriod === 'weekly') {
    totalUsesPerDay = (numberOfUsers * usesPerUserPerPeriod) / 7;
  } else {
    totalUsesPerDay = (numberOfUsers * usesPerUserPerPeriod) / 30;
  }

  const dailyTimeSavedMinutes = totalUsesPerDay * timeSavedPerUseMinutes;
  const weeklyTimeSavedMinutes = dailyTimeSavedMinutes * 7;
  const monthlyTimeSavedHours = (dailyTimeSavedMinutes * 30) / 60;
  const annualTimeSavedHours = (dailyTimeSavedMinutes * 365) / 60;

  const dailyMoneySaved = totalUsesPerDay * moneySavedPerUse;
  const weeklyMoneySaved = dailyMoneySaved * 7;
  const monthlyMoneySaved = dailyMoneySaved * 30;
  const annualMoneySaved = dailyMoneySaved * 365;

  const dailyRevenue = totalUsesPerDay * revenuePerUse;
  const weeklyRevenue = dailyRevenue * 7;
  const monthlyRevenue = dailyRevenue * 30;
  const annualRevenue = dailyRevenue * 365;

  return {
    timeSavedPerUseMinutes,
    moneySavedPerUse,
    revenuePerUse,
    numberOfUsers,
    usesPerUserPerPeriod,
    frequencyPeriod,
    timeSavedHours: annualTimeSavedHours,
    moneySavedDollars: annualMoneySaved,
    dailyTimeSavedMinutes,
    dailyMoneySaved,
    weeklyTimeSavedMinutes,
    weeklyMoneySaved,
    monthlyTimeSavedHours,
    monthlyMoneySaved,
    annualTimeSavedHours,
    annualMoneySaved,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    annualRevenue,
  };
}

const CHECKPOINT_NAMES = [
  'documentation',
  'squint_check',
  'auto_manual_switches',
  'automation_pyramid',
  'risk_governance',
] as const;

function parseAssessment(row: AssessmentRow) {
  return {
    ...row,
    tags: JSON.parse(row.tags),
    estimatedMetrics: JSON.parse(row.estimatedMetrics),
    estimatedCosts: JSON.parse(row.estimatedCosts),
  };
}

export async function assessmentRoutes(app: FastifyInstance) {
  const assessmentRepo = getAssessmentRepository();
  const checkpointRepo = getAssessmentCheckpointRepository();
  const useCaseRepo = getUseCaseRepository();
  const userRepo = getUserRepository();

  // GET /api/assessments
  app.get('/api/assessments', { preHandler: [authenticate] }, async (request) => {
    const query = request.query as Record<string, string | undefined>;

    let rows;
    if (request.user!.role === 'admin' && query.all === 'true') {
      // Admin requesting all assessments — requires read_all permission
      const { hasPermission } = await import('../auth/permissions.js');
      if (!hasPermission(request.user!.role, 'assessments:read_all')) {
        return [];
      }
      rows = assessmentRepo.findAll({
        category: query.category,
        department: query.department,
        status: query.status,
      });
    } else {
      // Default: own assessments only
      rows = assessmentRepo.findByUserId(request.user!.userId);
    }

    return rows.map(parseAssessment);
  });

  // GET /api/assessments/:id
  app.get('/api/assessments/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const row = assessmentRepo.findById(id);

    if (!row) {
      return reply.code(404).send({ error: 'Assessment not found' });
    }

    // Ownership check: owner or admin
    if (row.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to view this assessment' });
    }

    const checkpoints = checkpointRepo.findByAssessmentId(id);
    return { ...parseAssessment(row), checkpoints };
  });

  // POST /api/assessments
  app.post('/api/assessments', { preHandler: [authenticate] }, async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();
    const assessmentId = crypto.randomUUID();

    // Look up user for display name
    const user = userRepo.findById(request.user!.userId);
    const submittedBy = (body.submittedBy as string) || (user ? `${user.firstName} ${user.lastName}` : 'Unknown');
    const submitterTeam = (body.submitterTeam as string) || (body.department as string) || 'Other';

    const newAssessment = {
      id: assessmentId,
      title: body.title as string,
      description: body.description as string,
      category: body.category as string,
      aiTool: body.aiTool as string,
      department: body.department as string,
      status: 'draft' as const,
      tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
      estimatedMetrics: typeof body.estimatedMetrics === 'string' ? body.estimatedMetrics : JSON.stringify(body.estimatedMetrics || {}),
      estimatedCosts: typeof body.estimatedCosts === 'string' ? body.estimatedCosts : JSON.stringify(body.estimatedCosts || {}),
      submittedBy,
      submitterTeam,
      submittedById: request.user!.userId,
      promotedToUseCaseId: null,
      createdAt: now,
      updatedAt: now,
    };

    const created = assessmentRepo.create(newAssessment);

    // Initialize 5 empty checkpoints
    const checkpoints = CHECKPOINT_NAMES.map((checkpoint) => {
      return checkpointRepo.create({
        id: crypto.randomUUID(),
        assessmentId,
        checkpoint,
        status: 'not_started',
        score: null,
        notes: '',
        updatedAt: now,
      });
    });

    return reply.code(201).send({ ...parseAssessment(created), checkpoints });
  });

  // PUT /api/assessments/:id
  app.put('/api/assessments/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const existing = assessmentRepo.findById(id);

    if (!existing) {
      return reply.code(404).send({ error: 'Assessment not found' });
    }

    // Ownership check: owner or admin
    if (existing.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to update this assessment' });
    }

    const body = request.body as Record<string, unknown>;
    const now = new Date().toISOString();

    const updates: Record<string, unknown> = { updatedAt: now };
    const stringFields = ['title', 'description', 'category', 'aiTool', 'department', 'submittedBy', 'submitterTeam'] as const;

    for (const field of stringFields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }
    if (body.tags !== undefined) {
      updates.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }
    if (body.estimatedMetrics !== undefined) {
      updates.estimatedMetrics = typeof body.estimatedMetrics === 'string' ? body.estimatedMetrics : JSON.stringify(body.estimatedMetrics);
    }
    if (body.estimatedCosts !== undefined) {
      updates.estimatedCosts = typeof body.estimatedCosts === 'string' ? body.estimatedCosts : JSON.stringify(body.estimatedCosts);
    }

    // Auto-derive status: if all checkpoints scored, set to 'completed' (unless promoted)
    if (existing.status !== 'promoted') {
      const checkpoints = checkpointRepo.findByAssessmentId(id);
      const allScored = checkpoints.length === 5 && checkpoints.every(cp => cp.score !== null);
      if (allScored) {
        updates.status = 'completed';
      }
    }

    const updated = assessmentRepo.update(id, updates);
    return parseAssessment(updated!);
  });

  // DELETE /api/assessments/:id
  app.delete('/api/assessments/:id', { preHandler: [authenticate, requirePermission('assessments:delete')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = assessmentRepo.delete(id);

    if (!deleted) {
      return reply.code(404).send({ error: 'Assessment not found' });
    }

    return { success: true };
  });

  // PUT /api/assessments/:id/checkpoints/:checkpoint
  app.put('/api/assessments/:id/checkpoints/:checkpoint', { preHandler: [authenticate] }, async (request, reply) => {
    const { id, checkpoint } = request.params as { id: string; checkpoint: string };

    // Validate checkpoint name
    if (!CHECKPOINT_NAMES.includes(checkpoint as typeof CHECKPOINT_NAMES[number])) {
      return reply.code(400).send({ error: `Invalid checkpoint: ${checkpoint}` });
    }

    // Get parent assessment for ownership check
    const assessment = assessmentRepo.findById(id);
    if (!assessment) {
      return reply.code(404).send({ error: 'Assessment not found' });
    }

    if (assessment.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to update this assessment' });
    }

    const checkpointRow = checkpointRepo.findByAssessmentAndCheckpoint(id, checkpoint);
    if (!checkpointRow) {
      return reply.code(404).send({ error: 'Checkpoint not found' });
    }

    const body = request.body as { score?: number; status?: string; notes?: string };
    const now = new Date().toISOString();

    const checkpointUpdates: Record<string, unknown> = { updatedAt: now };

    if (body.notes !== undefined) {
      checkpointUpdates.notes = body.notes;
    }

    if (body.score !== undefined) {
      checkpointUpdates.score = body.score;
      // Derive status from score unless explicitly provided
      if (body.status !== undefined) {
        checkpointUpdates.status = body.status;
      } else {
        if (body.score <= 2) checkpointUpdates.status = 'fail';
        else if (body.score === 3) checkpointUpdates.status = 'concern';
        else checkpointUpdates.status = 'pass'; // 4-5
      }
    } else if (body.status !== undefined) {
      checkpointUpdates.status = body.status;
    }

    const updatedCheckpoint = checkpointRepo.update(checkpointRow.id, checkpointUpdates);

    // After updating, check if all 5 checkpoints now have scores
    const allCheckpoints = checkpointRepo.findByAssessmentId(id);
    const allScored = allCheckpoints.length === 5 && allCheckpoints.every(cp => cp.score !== null);

    if (allScored && (assessment.status === 'draft' || assessment.status === 'in_progress')) {
      assessmentRepo.update(id, { status: 'completed', updatedAt: now });

      // Send assessment_complete notification to the owner
      const owner = userRepo.findById(assessment.submittedById);
      if (owner) {
        getEmailService().send(owner.email, 'assessment_complete', {
          firstName: owner.firstName,
          itemTitle: assessment.title,
        }).catch(err => request.log.error(err, 'Failed to send email'));
      }
    } else if (assessment.status === 'draft' && body.score !== undefined) {
      // First checkpoint scored — move to in_progress
      assessmentRepo.update(id, { status: 'in_progress', updatedAt: now });
    }

    return updatedCheckpoint;
  });

  // POST /api/assessments/:id/promote
  app.post('/api/assessments/:id/promote', { preHandler: [authenticate, requirePermission('assessments:promote')] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const assessment = assessmentRepo.findById(id);

    if (!assessment) {
      return reply.code(404).send({ error: 'Assessment not found' });
    }

    // Ownership check
    if (assessment.submittedById !== request.user!.userId && request.user!.role !== 'admin') {
      return reply.code(403).send({ error: 'Not authorized to promote this assessment' });
    }

    if (assessment.status !== 'completed') {
      return reply.code(400).send({ error: 'Assessment must be completed before promoting' });
    }

    const now = new Date().toISOString();
    const useCaseId = crypto.randomUUID();

    // Create use case from assessment data — calculate full projections from estimates
    const estimatedMetrics = JSON.parse(assessment.estimatedMetrics);
    const fullMetrics = calculateMetricsFromEstimates(estimatedMetrics);

    const newUseCase = {
      id: useCaseId,
      title: assessment.title,
      description: assessment.description,
      whatWasBuilt: '',
      keyLearnings: '',
      metrics: JSON.stringify(fullMetrics),
      category: assessment.category,
      aiTool: assessment.aiTool,
      department: assessment.department,
      impact: 'medium',
      effort: 'medium',
      status: 'active',
      tags: assessment.tags, // already JSON string
      submittedBy: assessment.submittedBy,
      submitterTeam: assessment.submitterTeam,
      submittedById: assessment.submittedById,
      approvalStatus: 'pending',
      reviewedBy: null,
      reviewNotes: null,
      reviewedAt: null,
      actualCosts: assessment.estimatedCosts, // already JSON string
      assessmentId: id,
      createdAt: now,
      updatedAt: now,
    };

    const createdUseCase = useCaseRepo.create(newUseCase);

    // Update assessment status to promoted
    const updatedAssessment = assessmentRepo.update(id, {
      status: 'promoted',
      promotedToUseCaseId: useCaseId,
      updatedAt: now,
    });

    return {
      assessment: parseAssessment(updatedAssessment!),
      useCase: {
        ...createdUseCase,
        metrics: JSON.parse(createdUseCase.metrics),
        tags: JSON.parse(createdUseCase.tags),
        actualCosts: createdUseCase.actualCosts ? JSON.parse(createdUseCase.actualCosts) : null,
      },
    };
  });
}
