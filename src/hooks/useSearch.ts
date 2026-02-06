import { useMemo } from 'react';
import Fuse, { type FuseOptionKey } from 'fuse.js';

interface UseSearchOptions<T> {
  keys: FuseOptionKey<T>[];
  threshold?: number;
}

export function useSearch<T>(
  items: T[],
  query: string,
  options: UseSearchOptions<T>
): T[] {
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: options.keys,
        threshold: options.threshold ?? 0.4,
        includeScore: false,
        ignoreLocation: true,
      }),
    [items, options.keys, options.threshold]
  );

  return useMemo(() => {
    if (!query.trim()) return items;
    return fuse.search(query).map((result) => result.item);
  }, [fuse, query, items]);
}
