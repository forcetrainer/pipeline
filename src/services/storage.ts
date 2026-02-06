const STORAGE_PREFIX = 'ai-usecase-app';

function getKey(collection: string): string {
  return `${STORAGE_PREFIX}:${collection}`;
}

export function getAll<T>(collection: string): T[] {
  const raw = localStorage.getItem(getKey(collection));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export function setAll<T>(collection: string, items: T[]): void {
  localStorage.setItem(getKey(collection), JSON.stringify(items));
}

export function getById<T extends { id: string }>(
  collection: string,
  id: string
): T | undefined {
  const items = getAll<T>(collection);
  return items.find((item) => item.id === id);
}

export function create<T extends { id: string }>(
  collection: string,
  item: T
): T {
  const items = getAll<T>(collection);
  items.push(item);
  setAll(collection, items);
  return item;
}

export function update<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): T | undefined {
  const items = getAll<T>(collection);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...updates };
  setAll(collection, items);
  return items[index];
}

export function remove(collection: string, id: string): boolean {
  const items = getAll<{ id: string }>(collection);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  setAll(collection, filtered);
  return true;
}

export function isSeeded(collection: string): boolean {
  return localStorage.getItem(getKey(collection)) !== null;
}
