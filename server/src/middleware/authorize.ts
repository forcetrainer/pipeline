import type { FastifyRequest, FastifyReply } from 'fastify';

export function requireRole(...roles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(request.user.role)) {
      reply.code(403).send({
        error: `Forbidden: requires one of [${roles.join(', ')}] role`,
      });
    }
  };
}
