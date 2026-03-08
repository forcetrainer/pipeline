import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { users, useCases, prompts, refreshTokens } from '../schema.js';

export type UserRow = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UseCaseRow = InferSelectModel<typeof useCases>;
export type NewUseCase = InferInsertModel<typeof useCases>;
export type PromptRow = InferSelectModel<typeof prompts>;
export type NewPrompt = InferInsertModel<typeof prompts>;
export type RefreshTokenRow = InferSelectModel<typeof refreshTokens>;

export interface UseCaseFilters {
  category?: string;
  department?: string;
  impact?: string;
  status?: string;
  aiTool?: string;
  approvalStatus?: string;
}

export interface PromptFilters {
  category?: string;
  aiTool?: string;
  approvalStatus?: string;
}

export interface IUserRepository {
  findAll(): UserRow[];
  findById(id: string): UserRow | undefined;
  findByEmail(email: string): UserRow | undefined;
  create(user: NewUser): UserRow;
  update(id: string, data: Partial<UserRow>): UserRow | undefined;
  delete(id: string): boolean;
  count(): number;
}

export interface IUseCaseRepository {
  findAll(filters?: UseCaseFilters): UseCaseRow[];
  findById(id: string): UseCaseRow | undefined;
  create(useCase: NewUseCase): UseCaseRow;
  update(id: string, data: Partial<UseCaseRow>): UseCaseRow | undefined;
  delete(id: string): boolean;
  count(): number;
}

export interface IPromptRepository {
  findAll(filters?: PromptFilters): PromptRow[];
  findById(id: string): PromptRow | undefined;
  create(prompt: NewPrompt): PromptRow;
  update(id: string, data: Partial<PromptRow>): PromptRow | undefined;
  delete(id: string): boolean;
  count(): number;
}

export interface IRefreshTokenRepository {
  create(data: { id: string; token: string; userId: string; expiresAt: string; createdAt: string }): void;
  findByToken(token: string): RefreshTokenRow | undefined;
  deleteByToken(token: string): void;
  deleteByUserId(userId: string): void;
}
