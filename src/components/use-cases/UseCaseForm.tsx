import { type FormEvent, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import type { UseCase, UseCaseMetrics, CostTracking } from '../../types';
import { MetricsCalculator } from './MetricsCalculator';
import { CostTracker } from './CostTracker';

interface UseCaseFormProps {
  initialData?: Partial<UseCase>;
  onSubmit: (data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting?: boolean;
}

const categoryOptions = [
  { value: 'Content Creation', label: 'Content Creation' },
  { value: 'Code Review', label: 'Code Review' },
  { value: 'Data Analysis', label: 'Data Analysis' },
  { value: 'Customer Support', label: 'Customer Support' },
  { value: 'Research', label: 'Research' },
  { value: 'Automation', label: 'Automation' },
  { value: 'Other', label: 'Other' },
];

const aiToolOptions = [
  { value: 'ChatGPT', label: 'ChatGPT' },
  { value: 'Claude', label: 'Claude' },
  { value: 'Copilot', label: 'GitHub Copilot' },
  { value: 'Gemini', label: 'Gemini' },
  { value: 'Other', label: 'Other' },
];

const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Product', label: 'Product' },
  { value: 'Operations', label: 'Operations' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Other', label: 'Other' },
];

const impactOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const effortOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusOptions = [
  { value: 'idea', label: 'Idea' },
  { value: 'pilot', label: 'Pilot' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--nx-text-tertiary)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid var(--nx-cyan-aura)',
  marginBottom: '1rem',
};

const defaultMetrics: UseCaseMetrics = {
  timeSavedPerUseMinutes: 0,
  moneySavedPerUse: 0,
  revenuePerUse: 0,
  numberOfUsers: 0,
  usesPerUserPerPeriod: 0,
  frequencyPeriod: 'weekly',
  timeSavedHours: 0,
  moneySavedDollars: 0,
  dailyTimeSavedMinutes: 0,
  dailyMoneySaved: 0,
  weeklyTimeSavedMinutes: 0,
  weeklyMoneySaved: 0,
  monthlyTimeSavedHours: 0,
  monthlyMoneySaved: 0,
  annualTimeSavedHours: 0,
  annualMoneySaved: 0,
  dailyRevenue: 0,
  weeklyRevenue: 0,
  monthlyRevenue: 0,
  annualRevenue: 0,
};

function UseCaseForm({ initialData, onSubmit, isSubmitting }: UseCaseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [whatWasBuilt, setWhatWasBuilt] = useState(initialData?.whatWasBuilt || '');
  const [keyLearnings, setKeyLearnings] = useState(initialData?.keyLearnings || '');
  const [metrics, setMetrics] = useState<UseCaseMetrics>(initialData?.metrics || defaultMetrics);
  const [category, setCategory] = useState(initialData?.category || '');
  const [aiTool, setAiTool] = useState(initialData?.aiTool || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [impact, setImpact] = useState<UseCase['impact']>(initialData?.impact || 'medium');
  const [effort, setEffort] = useState<UseCase['effort']>(initialData?.effort || 'medium');
  const [status, setStatus] = useState<UseCase['status']>(initialData?.status || 'idea');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [submittedBy, setSubmittedBy] = useState(initialData?.submittedBy || '');
  const [actualCosts, setActualCosts] = useState<CostTracking | undefined>(initialData?.actualCosts);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      whatWasBuilt,
      keyLearnings,
      metrics,
      category,
      aiTool,
      department,
      impact,
      effort,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      submittedBy,
      submitterTeam: department,
      submittedById: '',
      approvalStatus: 'pending',
      actualCosts,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-lg p-6 space-y-8"
      style={{
        backgroundColor: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Basic Information */}
      <section>
        <h3 style={sectionHeaderStyle}>Basic Information</h3>
        <div className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g., Automated PR review summaries"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe the AI use case, how it works, and the value it provides..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>
      </section>

      {/* Metrics & Impact */}
      <section>
        <h3 style={sectionHeaderStyle}>Metrics & Impact</h3>
        <MetricsCalculator value={metrics} onChange={setMetrics} />
      </section>

      {/* Implementation Details */}
      <section>
        <h3 style={sectionHeaderStyle}>Implementation Details</h3>
        <div className="space-y-5">
          <Textarea
            label="What Was Built"
            placeholder="Describe what was built, the tools and integrations used..."
            value={whatWasBuilt}
            onChange={(e) => setWhatWasBuilt(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Key Learnings"
            placeholder="What did you learn? Any tips for others attempting something similar?"
            value={keyLearnings}
            onChange={(e) => setKeyLearnings(e.target.value)}
            rows={3}
          />
        </div>
      </section>

      {/* Cost Tracking */}
      <section>
        <CostTracker value={actualCosts} onChange={setActualCosts} />
      </section>

      {/* Classification */}
      <section>
        <h3 style={sectionHeaderStyle}>Classification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            options={categoryOptions}
            placeholder="Select a category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <Select
            label="AI Tool"
            options={aiToolOptions}
            placeholder="Select an AI tool"
            value={aiTool}
            onChange={(e) => setAiTool(e.target.value)}
            required
          />
        </div>
      </section>

      {/* Assessment */}
      <section>
        <h3 style={sectionHeaderStyle}>Assessment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Department"
            options={departmentOptions}
            placeholder="Select department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
          <Select
            label="Impact"
            options={impactOptions}
            value={impact}
            onChange={(e) => setImpact(e.target.value as UseCase['impact'])}
          />
          <Select
            label="Effort"
            options={effortOptions}
            value={effort}
            onChange={(e) => setEffort(e.target.value as UseCase['effort'])}
          />
        </div>
      </section>

      {/* Status & Meta */}
      <section>
        <h3 style={sectionHeaderStyle}>Status & Meta</h3>
        <div className="space-y-5">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as UseCase['status'])}
          />

          <Input
            label="Tags"
            placeholder="Comma-separated tags, e.g., productivity, writing, review"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            helperText="Separate multiple tags with commas"
          />

          <Input
            label="Submitted By"
            placeholder="Your name"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          />
        </div>
      </section>

      {/* Actions */}
      <div
        className="flex gap-3 pt-4"
        style={{ borderTop: '1px solid var(--nx-cyan-aura)' }}
      >
        <Button type="submit" isLoading={isSubmitting}>
          {initialData?.title ? 'Update Use Case' : 'Submit Use Case'}
        </Button>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { UseCaseForm };
