import { v4 as uuidv4 } from 'uuid';
import type { Prompt, PromptFilters, PromptSortField, SortDirection } from '../types';
import * as storage from './storage';

const COLLECTION = 'prompts';

export function getAllPrompts(): Prompt[] {
  return storage.getAll<Prompt>(COLLECTION);
}

export function getPromptById(id: string): Prompt | undefined {
  return storage.getById<Prompt>(COLLECTION, id);
}

export function createPrompt(
  data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>
): Prompt {
  const now = new Date().toISOString();
  const prompt: Prompt = {
    ...data,
    id: uuidv4(),
    rating: 0,
    ratingCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  return storage.create(COLLECTION, prompt);
}

export function updatePrompt(
  id: string,
  data: Partial<Prompt>
): Prompt | undefined {
  return storage.update<Prompt>(COLLECTION, id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export function ratePrompt(
  id: string,
  newRating: number
): Prompt | undefined {
  const prompt = getPromptById(id);
  if (!prompt) return undefined;
  const totalRating = prompt.rating * prompt.ratingCount + newRating;
  const newCount = prompt.ratingCount + 1;
  return updatePrompt(id, {
    rating: totalRating / newCount,
    ratingCount: newCount,
  });
}

export function deletePrompt(id: string): boolean {
  return storage.remove(COLLECTION, id);
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

export function isSeeded(): boolean {
  return storage.isSeeded(COLLECTION);
}

export function seedPrompts(data: Prompt[]): void {
  storage.setAll(COLLECTION, data);
}
