import { eq, and, type SQL } from 'drizzle-orm';
import { db } from '../index.js';
import { users, useCases, prompts, refreshTokens } from '../schema.js';
import type {
  IUserRepository,
  IUseCaseRepository,
  IPromptRepository,
  IRefreshTokenRepository,
  UserRow,
  NewUser,
  UseCaseRow,
  NewUseCase,
  PromptRow,
  NewPrompt,
  UseCaseFilters,
  PromptFilters,
} from './interfaces.js';

export class SqliteUserRepository implements IUserRepository {
  findAll(): UserRow[] {
    return db.select().from(users).all();
  }

  findById(id: string): UserRow | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  findByEmail(email: string): UserRow | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  create(user: NewUser): UserRow {
    db.insert(users).values(user).run();
    return db.select().from(users).where(eq(users.id, user.id!)).get()!;
  }

  update(id: string, data: Partial<UserRow>): UserRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;
    db.update(users).set(data).where(eq(users.id, id)).run();
    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;
    db.delete(users).where(eq(users.id, id)).run();
    return true;
  }

  count(): number {
    return db.select().from(users).all().length;
  }
}

export class SqliteUseCaseRepository implements IUseCaseRepository {
  findAll(filters?: UseCaseFilters): UseCaseRow[] {
    const conditions: SQL[] = [];

    if (filters) {
      if (filters.category) conditions.push(eq(useCases.category, filters.category));
      if (filters.department) conditions.push(eq(useCases.department, filters.department));
      if (filters.impact) conditions.push(eq(useCases.impact, filters.impact));
      if (filters.status) conditions.push(eq(useCases.status, filters.status));
      if (filters.aiTool) conditions.push(eq(useCases.aiTool, filters.aiTool));
      if (filters.approvalStatus) conditions.push(eq(useCases.approvalStatus, filters.approvalStatus));
    }

    if (conditions.length > 0) {
      return db.select().from(useCases).where(and(...conditions)).all();
    }
    return db.select().from(useCases).all();
  }

  findById(id: string): UseCaseRow | undefined {
    return db.select().from(useCases).where(eq(useCases.id, id)).get();
  }

  create(useCase: NewUseCase): UseCaseRow {
    db.insert(useCases).values(useCase).run();
    return db.select().from(useCases).where(eq(useCases.id, useCase.id!)).get()!;
  }

  update(id: string, data: Partial<UseCaseRow>): UseCaseRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;
    db.update(useCases).set(data).where(eq(useCases.id, id)).run();
    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;
    db.delete(useCases).where(eq(useCases.id, id)).run();
    return true;
  }

  count(): number {
    return db.select().from(useCases).all().length;
  }
}

export class SqlitePromptRepository implements IPromptRepository {
  findAll(filters?: PromptFilters): PromptRow[] {
    const conditions: SQL[] = [];

    if (filters) {
      if (filters.category) conditions.push(eq(prompts.category, filters.category));
      if (filters.aiTool) conditions.push(eq(prompts.aiTool, filters.aiTool));
      if (filters.approvalStatus) conditions.push(eq(prompts.approvalStatus, filters.approvalStatus));
    }

    if (conditions.length > 0) {
      return db.select().from(prompts).where(and(...conditions)).all();
    }
    return db.select().from(prompts).all();
  }

  findById(id: string): PromptRow | undefined {
    return db.select().from(prompts).where(eq(prompts.id, id)).get();
  }

  create(prompt: NewPrompt): PromptRow {
    db.insert(prompts).values(prompt).run();
    return db.select().from(prompts).where(eq(prompts.id, prompt.id!)).get()!;
  }

  update(id: string, data: Partial<PromptRow>): PromptRow | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;
    db.update(prompts).set(data).where(eq(prompts.id, id)).run();
    return this.findById(id);
  }

  delete(id: string): boolean {
    const existing = this.findById(id);
    if (!existing) return false;
    db.delete(prompts).where(eq(prompts.id, id)).run();
    return true;
  }

  count(): number {
    return db.select().from(prompts).all().length;
  }
}

export class SqliteRefreshTokenRepository implements IRefreshTokenRepository {
  create(data: { id: string; token: string; userId: string; expiresAt: string; createdAt: string }): void {
    db.insert(refreshTokens).values(data).run();
  }

  findByToken(token: string): ReturnType<IRefreshTokenRepository['findByToken']> {
    return db.select().from(refreshTokens).where(eq(refreshTokens.token, token)).get();
  }

  deleteByToken(token: string): void {
    db.delete(refreshTokens).where(eq(refreshTokens.token, token)).run();
  }

  deleteByUserId(userId: string): void {
    db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)).run();
  }
}
