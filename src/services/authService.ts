import type { User } from '../types';
import { api, setToken, clearToken } from './api';

interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  setToken(response.token);
  return response.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Best-effort server logout
  }
  clearToken();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/auth/me', { skipAuthRedirect: true });
  } catch {
    return null;
  }
}
