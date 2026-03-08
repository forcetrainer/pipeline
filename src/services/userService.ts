import type { User } from '../types';
import { api } from './api';

export async function getAllUsers(): Promise<User[]> {
  return api.get<User[]>('/users');
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    return await api.get<User>(`/users/${id}`);
  } catch {
    return undefined;
  }
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  return api.post<User>('/users', data);
}

export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User | undefined> {
  try {
    return await api.put<User>(`/users/${id}`, data);
  } catch {
    return undefined;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await api.delete(`/users/${id}`);
    return true;
  } catch {
    return false;
  }
}
