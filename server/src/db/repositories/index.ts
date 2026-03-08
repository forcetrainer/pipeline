import {
  SqliteUserRepository,
  SqliteUseCaseRepository,
  SqlitePromptRepository,
  SqliteRefreshTokenRepository,
} from './sqlite.js';
import type {
  IUserRepository,
  IUseCaseRepository,
  IPromptRepository,
  IRefreshTokenRepository,
} from './interfaces.js';

export type { IUserRepository, IUseCaseRepository, IPromptRepository, IRefreshTokenRepository };
export type { UserRow, NewUser, UseCaseRow, NewUseCase, PromptRow, NewPrompt, RefreshTokenRow, UseCaseFilters, PromptFilters } from './interfaces.js';

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
