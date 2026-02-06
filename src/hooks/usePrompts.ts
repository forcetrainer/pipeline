import { useState, useCallback, useMemo } from 'react';
import type { Prompt, PromptFilters, PromptSortField, SortDirection } from '../types';
import * as promptService from '../services/promptService';
import { seedPrompts as seedData } from '../data/seed';
import { useSearch } from './useSearch';

const PROMPT_SEARCH_KEYS = [
  { name: 'title' as const, weight: 2 },
  { name: 'content' as const, weight: 0.8 },
  { name: 'description' as const, weight: 1 },
  { name: 'problemBeingSolved' as const, weight: 1 },
  { name: 'tips' as const, weight: 0.5 },
  { name: 'tags' as const, weight: 1.5 },
  { name: 'submittedBy' as const, weight: 0.5 },
  { name: 'category' as const, weight: 1 },
];

function loadPrompts(): Prompt[] {
  if (!promptService.isSeeded()) {
    promptService.seedPrompts(seedData);
  }
  return promptService.getAllPrompts();
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>(loadPrompts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PromptFilters>({});
  const [sortField, setSortField] = useState<PromptSortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const reload = useCallback(() => {
    setPrompts(loadPrompts());
  }, []);

  const searched = useSearch(prompts, searchQuery, { keys: PROMPT_SEARCH_KEYS });
  const filtered = useMemo(
    () => promptService.filterPrompts(searched, filters),
    [searched, filters]
  );
  const sorted = useMemo(
    () => promptService.sortPrompts(filtered, sortField, sortDirection),
    [filtered, sortField, sortDirection]
  );

  const create = useCallback(
    (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>) => {
      const created = promptService.createPrompt(data);
      reload();
      return created;
    },
    [reload]
  );

  const update = useCallback(
    (id: string, data: Partial<Prompt>) => {
      const updated = promptService.updatePrompt(id, data);
      reload();
      return updated;
    },
    [reload]
  );

  const rate = useCallback(
    (id: string, rating: number) => {
      const updated = promptService.ratePrompt(id, rating);
      reload();
      return updated;
    },
    [reload]
  );

  const remove = useCallback(
    (id: string) => {
      const success = promptService.deletePrompt(id);
      reload();
      return success;
    },
    [reload]
  );

  const getById = useCallback((id: string) => {
    return promptService.getPromptById(id);
  }, []);

  return {
    prompts: sorted,
    allPrompts: prompts,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    create,
    update,
    rate,
    remove,
    getById,
    reload,
  };
}
