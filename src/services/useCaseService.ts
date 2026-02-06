import { v4 as uuidv4 } from 'uuid';
import type { UseCase, UseCaseFilters, UseCaseSortField, SortDirection } from '../types';
import { calculateScore } from '../utils/metricsCalculator';
import * as storage from './storage';

const COLLECTION = 'usecases';

export function getAllUseCases(): UseCase[] {
  return storage.getAll<UseCase>(COLLECTION);
}

export function getUseCaseById(id: string): UseCase | undefined {
  return storage.getById<UseCase>(COLLECTION, id);
}

export function createUseCase(
  data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>
): UseCase {
  const now = new Date().toISOString();
  const useCase: UseCase = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  return storage.create(COLLECTION, useCase);
}

export function updateUseCase(
  id: string,
  data: Partial<UseCase>
): UseCase | undefined {
  return storage.update<UseCase>(COLLECTION, id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export function deleteUseCase(id: string): boolean {
  return storage.remove(COLLECTION, id);
}

export function filterUseCases(
  useCases: UseCase[],
  filters: UseCaseFilters
): UseCase[] {
  return useCases.filter((uc) => {
    if (filters.category && uc.category !== filters.category) return false;
    if (filters.department && uc.department !== filters.department) return false;
    if (filters.impact && uc.impact !== filters.impact) return false;
    if (filters.status && uc.status !== filters.status) return false;
    if (filters.aiTool && uc.aiTool !== filters.aiTool) return false;
    if (filters.score && calculateScore(uc.metrics).grade !== filters.score) return false;
    return true;
  });
}

export function sortUseCases(
  useCases: UseCase[],
  field: UseCaseSortField,
  direction: SortDirection = 'desc'
): UseCase[] {
  const sorted = [...useCases];
  const dir = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (field) {
      case 'date':
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'timeSaved':
        return dir * (a.metrics.timeSavedHours - b.metrics.timeSavedHours);
      case 'moneySaved':
        return dir * (a.metrics.moneySavedDollars - b.metrics.moneySavedDollars);
      case 'title':
        return dir * a.title.localeCompare(b.title);
      case 'score':
        return dir * (calculateScore(a.metrics).overallScore - calculateScore(b.metrics).overallScore);
      case 'annualSavings':
        return dir * ((a.metrics.annualMoneySaved + a.metrics.annualTimeSavedHours * 50) -
          (b.metrics.annualMoneySaved + b.metrics.annualTimeSavedHours * 50));
      default:
        return 0;
    }
  });

  return sorted;
}

export function isSeeded(): boolean {
  return storage.isSeeded(COLLECTION);
}

export function seedUseCases(data: UseCase[]): void {
  storage.setAll(COLLECTION, data);
}
