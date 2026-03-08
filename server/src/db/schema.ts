import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const useCases = sqliteTable('use_cases', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  whatWasBuilt: text('what_was_built').notNull(),
  keyLearnings: text('key_learnings').notNull(),
  metrics: text('metrics').notNull(),
  category: text('category').notNull(),
  aiTool: text('ai_tool').notNull(),
  department: text('department').notNull(),
  impact: text('impact').notNull(),
  effort: text('effort').notNull(),
  status: text('status').notNull(),
  tags: text('tags').notNull(),
  submittedBy: text('submitted_by').notNull(),
  submitterTeam: text('submitter_team').notNull(),
  submittedById: text('submitted_by_id').references(() => users.id).notNull(),
  approvalStatus: text('approval_status').notNull(),
  reviewedBy: text('reviewed_by'),
  reviewNotes: text('review_notes'),
  reviewedAt: text('reviewed_at'),
  aiReadinessScore: integer('ai_readiness_score'),
  actualCosts: text('actual_costs'),
  assessmentId: text('assessment_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const prompts = sqliteTable('prompts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  description: text('description').notNull(),
  problemBeingSolved: text('problem_being_solved').notNull(),
  effectivenessRating: integer('effectiveness_rating').notNull(),
  tips: text('tips').notNull(),
  category: text('category').notNull(),
  aiTool: text('ai_tool').notNull(),
  useCaseId: text('use_case_id').references(() => useCases.id),
  tags: text('tags').notNull(),
  submittedBy: text('submitted_by').notNull(),
  submittedById: text('submitted_by_id').references(() => users.id).notNull(),
  approvalStatus: text('approval_status').notNull(),
  reviewedBy: text('reviewed_by'),
  reviewNotes: text('review_notes'),
  reviewedAt: text('reviewed_at'),
  starCount: integer('star_count').notNull().default(0),
  commentCount: integer('comment_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const promptStars = sqliteTable('prompt_stars', {
  id: text('id').primaryKey(),
  promptId: text('prompt_id').references(() => prompts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const promptComments = sqliteTable('prompt_comments', {
  id: text('id').primaryKey(),
  promptId: text('prompt_id').references(() => prompts.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const assessments = sqliteTable('assessments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  aiTool: text('ai_tool').notNull(),
  department: text('department').notNull(),
  status: text('status', { enum: ['draft', 'in_progress', 'completed', 'promoted'] }).notNull().default('draft'),
  tags: text('tags').notNull(),
  estimatedMetrics: text('estimated_metrics').notNull(),
  estimatedCosts: text('estimated_costs').notNull(),
  submittedBy: text('submitted_by').notNull(),
  submitterTeam: text('submitter_team').notNull(),
  submittedById: text('submitted_by_id').references(() => users.id).notNull(),
  promotedToUseCaseId: text('promoted_to_use_case_id').references(() => useCases.id),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const assessmentCheckpoints = sqliteTable('assessment_checkpoints', {
  id: text('id').primaryKey(),
  assessmentId: text('assessment_id').references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  checkpoint: text('checkpoint', { enum: ['documentation', 'squint_check', 'auto_manual_switches', 'automation_pyramid', 'risk_governance'] }).notNull(),
  status: text('status', { enum: ['not_started', 'pass', 'concern', 'fail'] }).notNull().default('not_started'),
  score: integer('score'),
  notes: text('notes').notNull().default(''),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  assessmentCheckpointUnique: uniqueIndex('assessment_checkpoint_unique').on(table.assessmentId, table.checkpoint),
}));
