import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, Tag } from '../components/ui';
import { useToast } from '../components/ui/ToastContainer';
import { useAuth } from '../contexts/AuthContext';
import * as promptService from '../services/promptService';
import { PROMPT_CATEGORIES, AI_TOOLS } from '../types';

type FormErrors = Partial<Record<string, string>>;

function NewPromptPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    description: '',
    problemBeingSolved: '',
    effectivenessRating: 0,
    tips: '',
    category: '',
    aiTool: '',
    tags: [] as string[],
  });

  function updateField(field: string, value: string | number) {
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
    if (!form.content.trim()) errs.content = 'Prompt text is required';
    else if (form.content.trim().length > 10000) errs.content = 'Prompt text must be 10000 characters or less';
    if (form.description.trim().length > 1000) errs.description = 'Description must be 1000 characters or less';
    if (form.problemBeingSolved.trim().length > 5000) errs.problemBeingSolved = 'Must be 5000 characters or less';
    if (form.tips.trim().length > 5000) errs.tips = 'Must be 5000 characters or less';
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

    try {
      await promptService.createPrompt({
        title: form.title.trim(),
        content: form.content.trim(),
        description: form.description.trim(),
        problemBeingSolved: form.problemBeingSolved.trim(),
        effectivenessRating: form.effectivenessRating,
        tips: form.tips.trim(),
        category: form.category,
        aiTool: form.aiTool || 'Other',
        tags: form.tags,
        submittedBy: submitterName,
        submittedById: currentUser?.id ?? '',
        approvalStatus: 'pending',
      });

      addToast('Prompt submitted successfully!', 'success');
      setSubmitted(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to submit prompt', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }));
  const aiToolOptions = AI_TOOLS.map((t) => ({ value: t, label: t }));

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
            <Button onClick={() => navigate('/prompts')}>Browse Prompts</Button>
            <Button variant="secondary" onClick={() => { setSubmitted(false); setForm({ title: '', content: '', description: '', problemBeingSolved: '', effectivenessRating: 0, tips: '', category: '', aiTool: '', tags: [] }); }}>
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
        to="/prompts"
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back to Prompts
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
          Submit a Prompt
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-2">Share an effective AI prompt with your team.</p>
        {currentUser && (
          <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-sm mb-8">
            Submitting as <span style={{ color: 'var(--nx-cyan-base)' }}>{currentUser.firstName} {currentUser.lastName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Code Review Checklist Prompt"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            required
          />

          <Textarea
            label="Prompt text"
            placeholder="Paste or write your prompt here..."
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            error={errors.content}
            rows={8}
            className="font-mono text-sm"
            required
          />

          <Input
            label="Description"
            placeholder="Brief description of what this prompt does"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />

          <Textarea
            label="Problem being solved"
            placeholder="What problem does this prompt help solve?"
            value={form.problemBeingSolved}
            onChange={(e) => updateField('problemBeingSolved', e.target.value)}
            rows={3}
          />

          {/* Effectiveness rating */}
          <Select
            label="Effectiveness rating"
            options={[
              { value: '0', label: 'Not rated' },
              { value: '1', label: '1 - Poor' },
              { value: '2', label: '2 - Fair' },
              { value: '3', label: '3 - Good' },
              { value: '4', label: '4 - Very Good' },
              { value: '5', label: '5 - Excellent' },
              { value: '6', label: '6' },
              { value: '7', label: '7' },
              { value: '8', label: '8' },
              { value: '9', label: '9' },
              { value: '10', label: '10 - Outstanding' },
            ]}
            value={String(form.effectivenessRating)}
            onChange={(e) => updateField('effectivenessRating', Number(e.target.value))}
            placeholder="Rate effectiveness"
          />

          <Textarea
            label="Tips for usage"
            placeholder="Any tips for getting the best results?"
            value={form.tips}
            onChange={(e) => updateField('tips', e.target.value)}
            rows={3}
          />

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

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>Submit Prompt</Button>
            <Link to="/prompts">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewPromptPage;
