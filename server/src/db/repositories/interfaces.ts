import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { users, useCases, prompts, refreshTokens, promptStars, promptComments, assessments, assessmentCheckpoints } from '../schema.js';

export type UserRow = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UseCaseRow = InferSelectModel<typeof useCases>;
export type NewUseCase = InferInsertModel<typeof useCases>;
export type PromptRow = InferSelectModel<typeof prompts>;
export type NewPrompt = InferInsertModel<typeof prompts>;
export type RefreshTokenRow = InferSelectModel<typeof refreshTokens>;
export type PromptStarRow = InferSelectModel<typeof promptStars>;
export type PromptCommentRow = InferSelectModel<typeof promptComments>;
export type AssessmentRow = InferSelectModel<typeof assessments>;
export type NewAssessment = InferInsertModel<typeof assessments>;
export type AssessmentCheckpointRow = InferSelectModel<typeof assessmentCheckpoints>;
export type NewAssessmentCheckpoint = InferInsertModel<typeof assessmentCheckpoints>;

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

export interface IPromptStarRepository {
  findByPromptAndUser(promptId: string, userId: string): PromptStarRow | undefined;
  findByUser(userId: string): PromptStarRow[];
  countByPrompt(promptId: string): number;
  create(star: { id: string; promptId: string; userId: string; createdAt: string }): PromptStarRow;
  delete(promptId: string, userId: string): boolean;
}

export interface IPromptCommentRepository {
  findByPrompt(promptId: string): PromptCommentRow[];
  findById(id: string): PromptCommentRow | undefined;
  countByPrompt(promptId: string): number;
  create(comment: { id: string; promptId: string; userId: string; parentId: string | null; content: string; createdAt: string; updatedAt: string }): PromptCommentRow;
  update(id: string, data: { content: string; updatedAt: string }): PromptCommentRow | undefined;
  delete(id: string): boolean;
}

export interface AssessmentFilters {
  status?: string;
  category?: string;
  department?: string;
  submittedById?: string;
}

export interface IAssessmentRepository {
  findAll(filters?: AssessmentFilters): AssessmentRow[];
  findById(id: string): AssessmentRow | undefined;
  findByUserId(userId: string): AssessmentRow[];
  create(assessment: NewAssessment): AssessmentRow;
  update(id: string, data: Partial<NewAssessment>): AssessmentRow | undefined;
  delete(id: string): boolean;
  count(filters?: AssessmentFilters): number;
}

export interface IAssessmentCheckpointRepository {
  findByAssessmentId(assessmentId: string): AssessmentCheckpointRow[];
  findById(id: string): AssessmentCheckpointRow | undefined;
  findByAssessmentAndCheckpoint(assessmentId: string, checkpoint: string): AssessmentCheckpointRow | undefined;
  create(checkpoint: NewAssessmentCheckpoint): AssessmentCheckpointRow;
  update(id: string, data: Partial<NewAssessmentCheckpoint>): AssessmentCheckpointRow | undefined;
  delete(id: string): boolean;
}

export interface IRefreshTokenRepository {
  create(data: { id: string; token: string; userId: string; expiresAt: string; createdAt: string }): void;
  findByToken(token: string): RefreshTokenRow | undefined;
  deleteByToken(token: string): void;
  deleteByUserId(userId: string): void;
}
