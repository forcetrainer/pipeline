import type { FastifyInstance } from 'fastify';
import { getUserRepository } from '../db/repositories/index.js';
import { generateToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken } from '../services/authService.js';
import { getStrategy } from '../auth/strategies.js';
import { authenticate } from '../middleware/authenticate.js';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/login
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    const strategy = getStrategy();
    const result = await strategy.authenticate(email, password);

    if (!result.success || !result.user) {
      return reply.code(401).send({ error: result.error || 'Authentication failed' });
    }

    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    const refreshToken = generateRefreshToken(result.user.id);

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60,
    });

    return { token, user: result.user };
  });

  // GET /api/auth/me
  app.get('/api/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
    const userRepo = getUserRepository();
    const user = userRepo.findById(request.user!.userId);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  // POST /api/auth/refresh
  app.post('/api/auth/refresh', async (request, reply) => {
    const refreshTokenValue = request.cookies?.refreshToken;
    if (!refreshTokenValue) {
      return reply.code(401).send({ error: 'No refresh token' });
    }
    try {
      const { userId } = verifyRefreshToken(refreshTokenValue);
      // Revoke old token (rotation)
      revokeRefreshToken(refreshTokenValue);
      // Look up user
      const userRepo = getUserRepository();
      const user = userRepo.findById(userId);
      if (!user) return reply.code(401).send({ error: 'User not found' });
      // Issue new tokens
      const newAccessToken = generateToken({ userId: user.id, email: user.email, role: user.role });
      const newRefreshToken = generateRefreshToken(userId);
      reply.setCookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60,
      });
      return { token: newAccessToken };
    } catch {
      reply.clearCookie('refreshToken', { path: '/api/auth' });
      return reply.code(401).send({ error: 'Invalid or expired refresh token' });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', async (request, reply) => {
    const refreshTokenValue = request.cookies?.refreshToken;
    if (refreshTokenValue) {
      revokeRefreshToken(refreshTokenValue);
    }
    reply.clearCookie('refreshToken', { path: '/api/auth' });
    return { success: true };
  });

  // GET /api/auth/sso/login — redirect to Entra ID
  app.get('/api/auth/sso/login', async (_request, reply) => {
    const authMode = process.env.AUTH_MODE || 'local';
    if (authMode === 'local') {
      return reply.code(400).send({ error: 'SSO is not enabled. Set AUTH_MODE=sso or AUTH_MODE=hybrid' });
    }
    // TODO: When implemented, redirect to Entra ID authorization URL
    return reply.code(501).send({
      error: 'SSO not yet implemented',
      message: 'Configure AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET',
    });
  });

  // GET /api/auth/sso/callback — handle Entra ID redirect
  app.get('/api/auth/sso/callback', async (_request, reply) => {
    const authMode = process.env.AUTH_MODE || 'local';
    if (authMode === 'local') {
      return reply.code(400).send({ error: 'SSO is not enabled' });
    }
    // TODO: Exchange authorization code for tokens, provision user, issue local JWT
    return reply.code(501).send({ error: 'SSO callback not yet implemented' });
  });
}
