import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, Tag } from '../components/ui';
import { useToast } from '../components/ui/ToastContainer';
import * as useCaseService from '../services/useCaseService';
import { USE_CASE_CATEGORIES, AI_TOOLS, DEPARTMENTS } from '../types';
import type { UseCase } from '../types';

type FormErrors = Partial<Record<string, string>>;

function NewUseCasePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    whatWasBuilt: '',
    keyLearnings: '',
    timeSavedHours: '',
    moneySavedDollars: '',
    category: '',
    aiTool: '',
    department: '',
    impact: '',
    effort: '',
    status: 'idea',
    tags: [] as string[],
    submittedBy: '',
    submitterTeam: '',
  });

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
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
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
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.submittedBy.trim()) errs.submittedBy = 'Your name is required';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const data: Omit<UseCase, 'id' | 'createdAt' | 'updatedAt'> = {
      title: form.title.trim(),
      description: form.description.trim(),
      whatWasBuilt: form.whatWasBuilt.trim(),
      keyLearnings: form.keyLearnings.trim(),
      metrics: {
        timeSavedHours: form.timeSavedHours ? Number(form.timeSavedHours) : 0,
        moneySavedDollars: form.moneySavedDollars ? Number(form.moneySavedDollars) : 0,
      },
      category: form.category,
      aiTool: form.aiTool || 'Other',
      department: form.department || 'Other',
      impact: (form.impact as UseCase['impact']) || 'medium',
      effort: (form.effort as UseCase['effort']) || 'medium',
      status: form.status as UseCase['status'],
      tags: form.tags,
      submittedBy: form.submittedBy.trim(),
      submitterTeam: form.submitterTeam.trim(),
    };

    useCaseService.createUseCase(data);
    addToast('Use case submitted successfully!', 'success');
    setIsSubmitting(false);
    navigate('/use-cases');
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
            fontFamily: "'Orbitron', sans-serif",
            color: 'var(--nx-text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Submit a Use Case
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-8">Share how your team is using AI to help others learn and adopt.</p>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Time saved (hours)"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 10"
              value={form.timeSavedHours}
              onChange={(e) => updateField('timeSavedHours', e.target.value)}
            />
            <Input
              label="Money saved ($)"
              type="number"
              min="0"
              placeholder="e.g. 500"
              value={form.moneySavedDollars}
              onChange={(e) => updateField('moneySavedDollars', e.target.value)}
            />
          </div>

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
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  color: 'var(--nx-text-primary)',
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--nx-cyan-base)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)')}
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

          {/* Submitter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Your name"
              placeholder="e.g. Jane Doe"
              value={form.submittedBy}
              onChange={(e) => updateField('submittedBy', e.target.value)}
              error={errors.submittedBy}
              required
            />
            <Select
              label="Team"
              options={departmentOptions}
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
              placeholder="Select your team"
            />
          </div>

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
