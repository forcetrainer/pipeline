import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { seedDatabase } from './db/seed.js';
import { authRoutes } from './routes/auth.js';
import { useCaseRoutes } from './routes/useCases.js';
import { promptRoutes } from './routes/prompts.js';
import { userRoutes } from './routes/users.js';
import { aiReadinessRoutes } from './routes/aiReadiness.js';
import { assessmentRoutes } from './routes/assessments.js';

const server = Fastify({ logger: true });

await server.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
});

await server.register(cookie);

// Seed database on startup
await seedDatabase();

// Health check
server.get('/api/health', async () => ({ status: 'ok' }));

// Register route plugins
await server.register(authRoutes);
await server.register(useCaseRoutes);
await server.register(promptRoutes);
await server.register(userRoutes);
await server.register(aiReadinessRoutes);
await server.register(assessmentRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  await server.register(import('@fastify/static'), {
    root: path.join(__dirname, '../../client/dist'),
    prefix: '/',
  });
  // SPA fallback - serve index.html for non-API routes
  server.setNotFoundHandler((request, reply) => {
    if (!request.url.startsWith('/api')) {
      return reply.sendFile('index.html');
    }
    reply.code(404).send({ error: 'Not found' });
  });
}

try {
  await server.listen({ port: 3001, host: '0.0.0.0' });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
