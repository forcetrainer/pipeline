export type FrequencyPeriod = 'daily' | 'weekly' | 'monthly';

export interface UseCaseMetrics {
  // Per-use savings (what the user enters)
  timeSavedPerUseMinutes: number;
  moneySavedPerUse: number;

  // Scale factors (what the user enters)
  numberOfUsers: number;
  usesPerUserPerPeriod: number;
  frequencyPeriod: FrequencyPeriod;

  // Calculated totals (backward compat - annual totals)
  timeSavedHours: number;
  moneySavedDollars: number;

  // Projected savings at different horizons
  dailyTimeSavedMinutes: number;
  dailyMoneySaved: number;
  weeklyTimeSavedMinutes: number;
  weeklyMoneySaved: number;
  monthlyTimeSavedHours: number;
  monthlyMoneySaved: number;
  annualTimeSavedHours: number;
  annualMoneySaved: number;
}

export type ScoreGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface UseCaseScore {
  valuePerUse: number;
  scaleFactor: number;
  overallScore: number;
  grade: ScoreGrade;
  quadrant: 'high-value-high-scale' | 'high-value-low-scale' | 'low-value-high-scale' | 'low-value-low-scale';
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

export type UseCaseSortField = 'date' | 'timeSaved' | 'moneySaved' | 'title' | 'score' | 'annualSavings';
export type PromptSortField = 'date' | 'rating' | 'effectiveness' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface UseCaseFilters {
  category?: string;
  department?: string;
  impact?: 'low' | 'medium' | 'high';
  status?: string;
  aiTool?: string;
  score?: ScoreGrade;
}

export interface PromptFilters {
  category?: string;
  aiTool?: string;
  minEffectiveness?: number;
  minRating?: number;
}
