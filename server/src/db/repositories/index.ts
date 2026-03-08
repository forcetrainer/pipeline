import {
  SqliteUserRepository,
  SqliteUseCaseRepository,
  SqlitePromptRepository,
  SqliteRefreshTokenRepository,
  SqlitePromptStarRepository,
  SqlitePromptCommentRepository,
  SqliteAssessmentRepository,
  SqliteAssessmentCheckpointRepository,
} from './sqlite.js';
import type {
  IUserRepository,
  IUseCaseRepository,
  IPromptRepository,
  IRefreshTokenRepository,
  IPromptStarRepository,
  IPromptCommentRepository,
  IAssessmentRepository,
  IAssessmentCheckpointRepository,
} from './interfaces.js';

export type { IUserRepository, IUseCaseRepository, IPromptRepository, IRefreshTokenRepository, IPromptStarRepository, IPromptCommentRepository, IAssessmentRepository, IAssessmentCheckpointRepository };
export type { UserRow, NewUser, UseCaseRow, NewUseCase, PromptRow, NewPrompt, RefreshTokenRow, PromptStarRow, PromptCommentRow, AssessmentRow, NewAssessment, AssessmentCheckpointRow, NewAssessmentCheckpoint, UseCaseFilters, PromptFilters, AssessmentFilters } from './interfaces.js';

export function getUserRepository(): IUserRepository {
  return new SqliteUserRepository();
}

export function getUseCaseRepository(): IUseCaseRepository {
  return new SqliteUseCaseRepository();
}

export function getPromptRepository(): IPromptRepository {
  return new SqlitePromptRepository();
}

export function getRefreshTokenRepository(): IRefreshTokenRepository {
  return new SqliteRefreshTokenRepository();
}

export function getPromptStarRepository(): IPromptStarRepository {
  return new SqlitePromptStarRepository();
}

export function getPromptCommentRepository(): IPromptCommentRepository {
  return new SqlitePromptCommentRepository();
}

export function getAssessmentRepository(): IAssessmentRepository {
  return new SqliteAssessmentRepository();
}

export function getAssessmentCheckpointRepository(): IAssessmentCheckpointRepository {
  return new SqliteAssessmentCheckpointRepository();
}
