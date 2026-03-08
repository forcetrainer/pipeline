import type { FastifyRequest, FastifyReply } from 'fastify';
import { hasPermission, type Permission } from '../auth/permissions.js';

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
      return;
    }
  };
}

export function requirePermission(...permissions: Permission[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      reply.code(401).send({ error: 'Authentication required' });
      return;
    }
    const hasAll = permissions.every(p => hasPermission(request.user!.role, p));
    if (!hasAll) {
      reply.code(403).send({ error: 'Insufficient permissions' });
      return;
    }
  };
}
