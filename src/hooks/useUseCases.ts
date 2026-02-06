import { useState, useCallback, useMemo } from 'react';
import type { UseCase, UseCaseFilters, UseCaseSortField, SortDirection } from '../types';
import * as useCaseService from '../services/useCaseService';
import { seedUseCases as seedData } from '../data/seed';
import { useSearch } from './useSearch';

const USE_CASE_SEARCH_KEYS = [
  { name: 'title' as const, weight: 2 },
  { name: 'description' as const, weight: 1 },
  { name: 'whatWasBuilt' as const, weight: 1 },
  { name: 'keyLearnings' as const, weight: 0.8 },
  { name: 'tags' as const, weight: 1.5 },
  { name: 'submittedBy' as const, weight: 0.5 },
  { name: 'category' as const, weight: 1 },
];

function loadUseCases(): UseCase[] {
  if (!useCaseService.isSeeded()) {
    useCaseService.seedUseCases(seedData);
  }
  return useCaseService.getAllUseCases();
}

export function useUseCases() {
  const [useCases, setUseCases] = useState<UseCase[]>(loadUseCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UseCaseFilters>({});
  const [sortField, setSortField] = useState<UseCaseSortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const reload = useCallback(() => {
    setUseCases(loadUseCases());
  }, []);

  const searched = useSearch(useCases, searchQuery, { keys: USE_CASE_SEARCH_KEYS });
  const filtered = useMemo(
    () => useCaseService.filterUseCases(searched, filters),
    [searched, filters]
  );
  const sorted = useMemo(
    () => useCaseService.sortUseCases(filtered, sortField, sortDirection),
    [filtered, sortField, sortDirection]
  );

  const create = useCallback(
    (data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = useCaseService.createUseCase(data);
      reload();
      return created;
    },
    [reload]
  );

  const update = useCallback(
    (id: string, data: Partial<UseCase>) => {
      const updated = useCaseService.updateUseCase(id, data);
      reload();
      return updated;
    },
    [reload]
  );

  const remove = useCallback(
    (id: string) => {
      const success = useCaseService.deleteUseCase(id);
      reload();
      return success;
    },
    [reload]
  );

  const getById = useCallback((id: string) => {
    return useCaseService.getUseCaseById(id);
  }, []);

  return {
    useCases: sorted,
    allUseCases: useCases,
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
    remove,
    getById,
    reload,
  };
}
