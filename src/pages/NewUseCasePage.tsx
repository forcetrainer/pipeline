import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, Tag } from '../components/ui';
import { useToast } from '../components/ui/ToastContainer';
import { useAuth } from '../contexts/AuthContext';
import * as useCaseService from '../services/useCaseService';
import { USE_CASE_CATEGORIES, AI_TOOLS, DEPARTMENTS } from '../types';
import type { UseCase, UseCaseMetrics } from '../types';
import { MetricsCalculator } from '../components/use-cases/MetricsCalculator';
import { CostTracker } from '../components/use-cases/CostTracker';
import { calculateMetrics } from '../utils/metricsCalculator';
import type { CostTracking } from '../types';

type FormErrors = Partial<Record<string, string>>;

function NewUseCasePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    whatWasBuilt: '',
    keyLearnings: '',
    category: '',
    aiTool: '',
    department: '',
    impact: '',
    effort: '',
    status: 'idea',
    tags: [] as string[],
    submitterTeam: '',
  });

  const [actualCosts, setActualCosts] = useState<CostTracking | undefined>(undefined);

  const [metrics, setMetrics] = useState<UseCaseMetrics>(() =>
    calculateMetrics({
      timeSavedPerUseMinutes: 0,
      moneySavedPerUse: 0,
      revenuePerUse: 0,
      numberOfUsers: 1,
      usesPerUserPerPeriod: 1,
      frequencyPeriod: 'weekly',
    })
  );

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().slice(0, 50);
    if (tag && !form.tags.includes(tag) && form.tags.length < 20) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.trim().length > 200) errs.title = 'Title must be 200 characters or less';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length > 5000) errs.description = 'Description must be 5000 characters or less';
    if (form.whatWasBuilt.trim().length > 5000) errs.whatWasBuilt = 'Must be 5000 characters or less';
    if (form.keyLearnings.trim().length > 5000) errs.keyLearnings = 'Must be 5000 characters or less';
    if (!form.category) errs.category = 'Category is required';
    if (form.tags.length > 20) errs.tags = 'Maximum 20 tags allowed';
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const submitterName = currentUser
      ? `${currentUser.firstName} ${currentUser.lastName}`
      : '';

    const data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'> = {
      title: form.title.trim(),
      description: form.description.trim(),
      whatWasBuilt: form.whatWasBuilt.trim(),
      keyLearnings: form.keyLearnings.trim(),
      metrics,
      category: form.category,
      aiTool: form.aiTool || 'Other',
      department: form.department || 'Other',
      impact: (form.impact as UseCase['impact']) || 'medium',
      effort: (form.effort as UseCase['effort']) || 'medium',
      status: form.status as UseCase['status'],
      tags: form.tags,
      submittedBy: submitterName,
      submitterTeam: form.submitterTeam.trim(),
      submittedById: currentUser?.id ?? '',
      approvalStatus: 'pending',
      actualCosts,
    };

    try {
      await useCaseService.createUseCase(data);
      addToast('Use case submitted successfully!', 'success');
      setSubmitted(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to submit use case', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = USE_CASE_CATEGORIES.map((c) => ({ value: c, label: c }));
  const aiToolOptions = AI_TOOLS.map((t) => ({ value: t, label: t }));
  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));
  const impactOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
  const statusOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'pilot', label: 'Pilot' },
    { value: 'active', label: 'Active' },
  ];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="rounded-lg p-8 max-w-md text-center"
          style={{
            backgroundColor: 'var(--nx-void-panel)',
            border: '1px solid var(--color-border-strong)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.25)' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--nx-green-base)" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--nx-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Submission Received
          </h2>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-6">
            Your submission has been sent for admin review. You will be able to see its status on your submissions page.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/use-cases')}>Browse Use Cases</Button>
            <Button variant="secondary" onClick={() => { setSubmitted(false); setForm({ title: '', description: '', whatWasBuilt: '', keyLearnings: '', category: '', aiTool: '', department: '', impact: '', effort: '', status: 'idea', tags: [], submitterTeam: '' }); }}>
              Submit Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/use-cases"
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back to Use Cases
      </Link>

      <div className="max-w-2xl">
        <h1
          className="text-3xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--nx-text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Submit a Use Case
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-2">Share how your team is using AI to help others learn and adopt.</p>
        {currentUser && (
          <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-sm mb-8">
            Submitting as <span style={{ color: 'var(--nx-cyan-base)' }}>{currentUser.firstName} {currentUser.lastName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Automated Code Review with Copilot"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe the use case in detail..."
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            rows={4}
            required
          />

          <Textarea
            label="What was built"
            placeholder="Describe what you built or implemented..."
            value={form.whatWasBuilt}
            onChange={(e) => updateField('whatWasBuilt', e.target.value)}
            rows={3}
          />

          <Textarea
            label="Key learnings"
            placeholder="What did you learn along the way?"
            value={form.keyLearnings}
            onChange={(e) => updateField('keyLearnings', e.target.value)}
            rows={3}
          />

          {/* Metrics */}
          <MetricsCalculator value={metrics} onChange={setMetrics} />

          {/* Cost Tracking */}
          <CostTracker value={actualCosts} onChange={setActualCosts} />

          {/* Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              placeholder="Select a category"
              error={errors.category}
            />
            <Select
              label="AI Tool"
              options={aiToolOptions}
              value={form.aiTool}
              onChange={(e) => updateField('aiTool', e.target.value)}
              placeholder="Select AI tool"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Impact"
              options={impactOptions}
              value={form.impact}
              onChange={(e) => updateField('impact', e.target.value)}
              placeholder="Select impact level"
            />
            <Select
              label="Effort"
              options={impactOptions}
              value={form.effort}
              onChange={(e) => updateField('effort', e.target.value)}
              placeholder="Select effort level"
            />
          </div>

          <Select
            label="Status"
            options={statusOptions}
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          />

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: 'var(--nx-text-secondary)', fontSize: '14px', fontWeight: 500 }}>Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 h-10 px-3 rounded-md transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--nx-void-elevated)',
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--nx-text-primary)',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--nx-cyan-base)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-default)')}
              />
              <Button type="button" variant="secondary" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-1">
                {form.tags.map((tag) => (
                  <Tag key={tag} onRemove={() => removeTag(tag)}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>

          {/* Team */}
          <Select
            label="Team"
            options={departmentOptions}
            value={form.department}
            onChange={(e) => updateField('department', e.target.value)}
            placeholder="Select your team"
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>Submit Use Case</Button>
            <Link to="/use-cases">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewUseCasePage;
