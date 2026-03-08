import type { Prompt, PromptFilters, PromptSortField, SortDirection } from '../types';
import { api } from './api';

export async function getAllPrompts(): Promise<Prompt[]> {
  return api.get<Prompt[]>('/prompts');
}

export async function getPromptById(id: string): Promise<Prompt | undefined> {
  try {
    return await api.get<Prompt>(`/prompts/${id}`);
  } catch {
    return undefined;
  }
}

export async function createPrompt(
  data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>
): Promise<Prompt> {
  return api.post<Prompt>('/prompts', data);
}

export async function updatePrompt(
  id: string,
  data: Partial<Prompt>
): Promise<Prompt | undefined> {
  try {
    return await api.put<Prompt>(`/prompts/${id}`, data);
  } catch {
    return undefined;
  }
}

export async function ratePrompt(
  id: string,
  rating: number
): Promise<Prompt | undefined> {
  try {
    return await api.post<Prompt>(`/prompts/${id}/rate`, { rating });
  } catch {
    return undefined;
  }
}

export async function deletePrompt(id: string): Promise<boolean> {
  try {
    await api.delete(`/prompts/${id}`);
    return true;
  } catch {
    return false;
  }
}

export function filterPrompts(
  prompts: Prompt[],
  filters: PromptFilters
): Prompt[] {
  return prompts.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.aiTool && p.aiTool !== filters.aiTool) return false;
    if (filters.minEffectiveness && p.effectivenessRating < filters.minEffectiveness) return false;
    if (filters.minRating && p.rating < filters.minRating) return false;
    return true;
  });
}

export function sortPrompts(
  prompts: Prompt[],
  field: PromptSortField,
  direction: SortDirection = 'desc'
): Prompt[] {
  const sorted = [...prompts];
  const dir = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (field) {
      case 'date':
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'rating':
        return dir * (a.rating - b.rating);
      case 'effectiveness':
        return dir * (a.effectivenessRating - b.effectivenessRating);
      case 'title':
        return dir * a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return sorted;
}
