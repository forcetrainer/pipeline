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

export function logout(): void {
  clearToken();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await api.get<User>('/auth/me', { skipAuthRedirect: true });
  } catch {
    return null;
  }
}
