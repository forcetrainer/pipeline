import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, Tag } from '../components/ui';
import { useToast } from '../components/ui/ToastContainer';
import { useAuth } from '../contexts/AuthContext';
import * as useCaseService from '../services/useCaseService';
import { USE_CASE_CATEGORIES, AI_TOOLS, DEPARTMENTS } from '../types';
import type { UseCase, UseCaseMetrics } from '../types';
import { MetricsCalculator } from '../components/use-cases/MetricsCalculator';
import { CostTracker } from '../components/use-cases/CostTracker';
import type { CostTracking } from '../types';

type FormErrors = Partial<Record<string, string>>;

function EditUseCasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const [metrics, setMetrics] = useState<UseCaseMetrics | null>(null);
  const [actualCosts, setActualCosts] = useState<CostTracking | undefined>(undefined);

  useEffect(() => {
    async function load() {
      if (!id) { setLoading(false); return; }
      const uc = await useCaseService.getUseCaseById(id);
      if (!uc) {
        addToast('Use case not found', 'error');
        navigate('/use-cases');
        return;
      }
      // Check ownership
      if (uc.submittedById !== currentUser?.id && currentUser?.role !== 'admin') {
        addToast('Not authorized to edit this use case', 'error');
        navigate(`/use-cases/${id}`);
        return;
      }
      setForm({
        title: uc.title,
        description: uc.description,
        whatWasBuilt: uc.whatWasBuilt || '',
        keyLearnings: uc.keyLearnings || '',
        category: uc.category,
        aiTool: uc.aiTool,
        department: uc.department,
        impact: uc.impact,
        effort: uc.effort,
        status: uc.status,
        tags: uc.tags || [],
        submitterTeam: uc.submitterTeam || '',
      });
      setMetrics(uc.metrics);
      setActualCosts(uc.actualCosts || undefined);
      setLoading(false);
    }
    load();
  }, [id]);

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

    try {
      await useCaseService.updateUseCase(id!, {
        title: form.title.trim(),
        description: form.description.trim(),
        whatWasBuilt: form.whatWasBuilt.trim(),
        keyLearnings: form.keyLearnings.trim(),
        metrics: metrics!,
        category: form.category,
        aiTool: form.aiTool || 'Other',
        department: form.department || 'Other',
        impact: form.impact as UseCase['impact'],
        effort: form.effort as UseCase['effort'],
        status: form.status as UseCase['status'],
        tags: form.tags,
        actualCosts,
      });
      addToast('Use case updated successfully!', 'success');
      navigate(`/use-cases/${id}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update use case', 'error');
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

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/use-cases/${id}`}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back to Use Case
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
          Edit Use Case
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-8">
          Update the details, metrics, and costs for this use case.
        </p>

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
            <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
            <Link to={`/use-cases/${id}`}>
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUseCasePage;
