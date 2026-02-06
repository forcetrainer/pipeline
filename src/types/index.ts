export interface UseCaseMetrics {
  timeSavedHours: number;
  moneySavedDollars: number;
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  whatWasBuilt: string;
  keyLearnings: string;
  metrics: UseCaseMetrics;
  category: string;
  aiTool: string;
  department: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  status: 'idea' | 'pilot' | 'active' | 'archived';
  tags: string[];
  submittedBy: string;
  submitterTeam: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description: string;
  problemBeingSolved: string;
  effectivenessRating: number;
  tips: string;
  category: string;
  aiTool: string;
  useCaseId?: string;
  tags: string[];
  submittedBy: string;
  rating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export type UseCaseCategory =
  | 'Content Creation'
  | 'Code Review'
  | 'Data Analysis'
  | 'Customer Support'
  | 'Documentation'
  | 'Research'
  | 'Automation'
  | 'Other';

export type PromptCategory =
  | 'Writing'
  | 'Coding'
  | 'Analysis'
  | 'Summarization'
  | 'Translation'
  | 'Creative'
  | 'Other';

export type AITool =
  | 'ChatGPT'
  | 'Claude'
  | 'Copilot'
  | 'Gemini'
  | 'Midjourney'
  | 'Other';

export type Department =
  | 'Engineering'
  | 'Marketing'
  | 'Sales'
  | 'Product'
  | 'Design'
  | 'HR'
  | 'Finance'
  | 'Operations'
  | 'Other';

export const USE_CASE_CATEGORIES: UseCaseCategory[] = [
  'Content Creation',
  'Code Review',
  'Data Analysis',
  'Customer Support',
  'Documentation',
  'Research',
  'Automation',
  'Other',
];

export const PROMPT_CATEGORIES: PromptCategory[] = [
  'Writing',
  'Coding',
  'Analysis',
  'Summarization',
  'Translation',
  'Creative',
  'Other',
];

export const AI_TOOLS: AITool[] = [
  'ChatGPT',
  'Claude',
  'Copilot',
  'Gemini',
  'Midjourney',
  'Other',
];

export const DEPARTMENTS: Department[] = [
  'Engineering',
  'Marketing',
  'Sales',
  'Product',
  'Design',
  'HR',
  'Finance',
  'Operations',
  'Other',
];

export type UseCaseSortField = 'date' | 'timeSaved' | 'moneySaved' | 'title';
export type PromptSortField = 'date' | 'rating' | 'effectiveness' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface UseCaseFilters {
  category?: string;
  department?: string;
  impact?: 'low' | 'medium' | 'high';
  status?: string;
  aiTool?: string;
}

export interface PromptFilters {
  category?: string;
  aiTool?: string;
  minEffectiveness?: number;
  minRating?: number;
}
