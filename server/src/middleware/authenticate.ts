import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../services/authService.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId: string; email: string; role: string };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    request.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    reply.code(401).send({ error: 'Invalid or expired token' });
  }
}
