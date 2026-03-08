import type { UseCase, UseCaseFilters, UseCaseSortField, SortDirection } from '../types';
import { calculateScore } from '../utils/metricsCalculator';
import { api } from './api';

export async function getAllUseCases(): Promise<UseCase[]> {
  return api.get<UseCase[]>('/use-cases');
}

export async function getUseCaseById(id: string): Promise<UseCase | undefined> {
  try {
    return await api.get<UseCase>(`/use-cases/${id}`);
  } catch {
    return undefined;
  }
}

export async function createUseCase(
  data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UseCase> {
  return api.post<UseCase>('/use-cases', data);
}

export async function updateUseCase(
  id: string,
  data: Partial<UseCase>
): Promise<UseCase | undefined> {
  try {
    return await api.put<UseCase>(`/use-cases/${id}`, data);
  } catch {
    return undefined;
  }
}

export async function deleteUseCase(id: string): Promise<boolean> {
  try {
    await api.delete(`/use-cases/${id}`);
    return true;
  } catch {
    return false;
  }
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
