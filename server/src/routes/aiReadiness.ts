import type { FastifyInstance } from 'fastify';

export async function aiReadinessRoutes(app: FastifyInstance) {
  // GET /api/ai-readiness/:useCaseId
  app.get('/api/ai-readiness/:useCaseId', async () => {
    return {
      status: 'not_implemented',
      message: 'AI Readiness Check coming soon',
    };
  });
}
