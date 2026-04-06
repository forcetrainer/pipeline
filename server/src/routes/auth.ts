import type { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { getUserRepository } from '../db/repositories/index.js';
import { generateToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, hashPassword } from '../services/authService.js';
import { getStrategy } from '../auth/strategies.js';
import { authenticate } from '../middleware/authenticate.js';
import { getEmailService } from '../services/emailService.js';

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

    if (result.user.status === 'pending') {
      return reply.code(403).send({ error: 'Your account is pending approval. Please contact an administrator.' });
    }
    if (result.user.status === 'disabled') {
      return reply.code(403).send({ error: 'Your account has been disabled. Please contact an administrator.' });
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

  // POST /api/auth/register
  app.post('/api/auth/register', async (request, reply) => {
    const { email, firstName, lastName, password } = request.body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
    };

    // Validate all fields present
    if (!email || !firstName || !lastName || !password) {
      return reply.code(400).send({ error: 'All fields are required: email, firstName, lastName, password' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return reply.code(400).send({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' });
    }

    const userRepo = getUserRepository();

    // Check if email already exists
    const existing = userRepo.findByEmail(email);
    if (existing) {
      return reply.code(409).send({ error: 'An account with this email already exists' });
    }

    const hashedPw = await hashPassword(password);
    const now = new Date().toISOString();

    // TODO: When email verification is enabled, set status to 'pending' and send verification email
    const newUser = {
      id: crypto.randomUUID(),
      email,
      firstName,
      lastName,
      role: 'user' as const,
      status: 'active',
      password: hashedPw,
      createdAt: now,
      updatedAt: now,
    };

    userRepo.create(newUser);

    // Fire-and-forget welcome email
    getEmailService().send(email, 'welcome', { firstName }).catch((err: unknown) => {
      request.log.error(err, 'Failed to send welcome email');
    });

    return reply.code(201).send({ success: true, message: 'Account created. You can now log in.' });
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
