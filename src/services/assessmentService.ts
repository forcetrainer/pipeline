import type { Assessment, AssessmentCheckpoint, AssessmentFilters } from '../types';
import { api } from './api';

export async function getMyAssessments(): Promise<Assessment[]> {
  return api.get<Assessment[]>('/assessments');
}

export async function getAllAssessments(): Promise<Assessment[]> {
  return api.get<Assessment[]>('/assessments?all=true');
}

export async function getAssessmentById(id: string): Promise<(Assessment & { checkpoints: AssessmentCheckpoint[] }) | undefined> {
  try {
    return await api.get<Assessment & { checkpoints: AssessmentCheckpoint[] }>(`/assessments/${id}`);
  } catch {
    return undefined;
  }
}

export async function createAssessment(data: {
  title: string;
  description: string;
  category: string;
  aiTool: string;
  department: string;
  tags: string[];
  estimatedMetrics: Assessment['estimatedMetrics'];
  estimatedCosts: Assessment['estimatedCosts'];
}): Promise<Assessment> {
  return api.post<Assessment>('/assessments', data);
}

export async function updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment | undefined> {
  try {
    return await api.put<Assessment>(`/assessments/${id}`, data);
  } catch {
    return undefined;
  }
}

export async function deleteAssessment(id: string): Promise<boolean> {
  try {
    await api.delete(`/assessments/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function updateCheckpoint(
  assessmentId: string,
  checkpoint: string,
  data: { score?: number; status?: string; notes?: string }
): Promise<AssessmentCheckpoint | undefined> {
  try {
    return await api.put<AssessmentCheckpoint>(`/assessments/${assessmentId}/checkpoints/${checkpoint}`, data);
  } catch {
    return undefined;
  }
}

export async function promoteToUseCase(assessmentId: string): Promise<{ assessment: Assessment; useCase: any } | undefined> {
  try {
    return await api.post<{ assessment: Assessment; useCase: any }>(`/assessments/${assessmentId}/promote`, {});
  } catch {
    return undefined;
  }
}

export function filterAssessments(assessments: Assessment[], filters: AssessmentFilters): Assessment[] {
  return assessments.filter((a) => {
    if (filters.status && a.status !== filters.status) return false;
    if (filters.category && a.category !== filters.category) return false;
    if (filters.department && a.department !== filters.department) return false;
    return true;
  });
}
