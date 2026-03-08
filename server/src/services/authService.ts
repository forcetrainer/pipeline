import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getRefreshTokenRepository } from '../db/repositories/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function generateRefreshToken(userId: string): string {
  const tokenRepo = getRefreshTokenRepository();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  tokenRepo.create({
    id: crypto.randomUUID(),
    token,
    userId,
    expiresAt,
    createdAt: new Date().toISOString(),
  });
  return token;
}

export function verifyRefreshToken(token: string): { userId: string } {
  const tokenRepo = getRefreshTokenRepository();
  const record = tokenRepo.findByToken(token);
  if (!record) throw new Error('Invalid refresh token');
  if (new Date(record.expiresAt) < new Date()) {
    tokenRepo.deleteByToken(token);
    throw new Error('Refresh token expired');
  }
  return { userId: record.userId };
}

export function revokeRefreshToken(token: string): void {
  const tokenRepo = getRefreshTokenRepository();
  tokenRepo.deleteByToken(token);
}

export function revokeAllUserTokens(userId: string): void {
  const tokenRepo = getRefreshTokenRepository();
  tokenRepo.deleteByUserId(userId);
}
