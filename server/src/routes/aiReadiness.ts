import type { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/authenticate.js';
import { getUseCaseRepository } from '../db/repositories/index.js';

export async function aiReadinessRoutes(app: FastifyInstance) {
  // GET /api/ai-readiness/:useCaseId
  app.get('/api/ai-readiness/:useCaseId', { preHandler: [authenticate] }, async (request, reply) => {
    const { useCaseId } = request.params as { useCaseId: string };
    const useCaseRepo = getUseCaseRepository();
    const useCase = useCaseRepo.findById(useCaseId);
    if (!useCase) return reply.code(404).send({ error: 'Use case not found' });

    // Mock scoring based on existing fields
    const metrics = JSON.parse(useCase.metrics);
    let score = 0;

    // Has time savings data
    if (metrics.timeSavedPerUseMinutes > 0) score += 20;
    // Has cost savings data
    if (metrics.moneySavedPerUse > 0) score += 20;
    // Has multiple users (scale)
    if (metrics.numberOfUsers >= 5) score += 15;
    else if (metrics.numberOfUsers >= 2) score += 10;
    // High impact
    if (useCase.impact === 'high') score += 15;
    else if (useCase.impact === 'medium') score += 10;
    // Low effort
    if (useCase.effort === 'low') score += 15;
    else if (useCase.effort === 'medium') score += 10;
    // Active status
    if (useCase.status === 'active') score += 15;
    else if (useCase.status === 'pilot') score += 10;

    return {
      useCaseId,
      score,
      maxScore: 100,
      status: 'mock',
      message: 'This is a preliminary assessment. Full AI Readiness Check coming soon.',
      breakdown: {
        timeSavings: metrics.timeSavedPerUseMinutes > 0 ? 'Data available' : 'Missing',
        costSavings: metrics.moneySavedPerUse > 0 ? 'Data available' : 'Missing',
        scale: metrics.numberOfUsers >= 5 ? 'Good' : metrics.numberOfUsers >= 2 ? 'Moderate' : 'Low',
        impact: useCase.impact,
        effort: useCase.effort,
        maturity: useCase.status,
      },
    };
  });
}
