import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Input, Textarea, Select, StarRating, Tag } from '../components/ui';
import { useToast } from '../components/ui/ToastContainer';
import * as promptService from '../services/promptService';
import { PROMPT_CATEGORIES, AI_TOOLS } from '../types';

type FormErrors = Partial<Record<string, string>>;

function NewPromptPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    submittedBy: '',
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
    if (!form.content.trim()) errs.content = 'Prompt text is required';
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

    promptService.createPrompt({
      title: form.title.trim(),
      content: form.content.trim(),
      description: form.description.trim(),
      problemBeingSolved: form.problemBeingSolved.trim(),
      effectivenessRating: form.effectivenessRating,
      tips: form.tips.trim(),
      category: form.category,
      aiTool: form.aiTool || 'Other',
      tags: form.tags,
      submittedBy: form.submittedBy.trim(),
    });

    addToast('Prompt submitted successfully!', 'success');
    setIsSubmitting(false);
    navigate('/prompts');
  }

  const categoryOptions = PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }));
  const aiToolOptions = AI_TOOLS.map((t) => ({ value: t, label: t }));

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
            fontFamily: "'Orbitron', sans-serif",
            color: 'var(--nx-text-primary)',
            letterSpacing: '0.05em',
          }}
        >
          Submit a Prompt
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-8">Share an effective AI prompt with your team.</p>

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
          <div className="flex flex-col gap-1.5">
            <label style={{ color: 'var(--nx-text-secondary)', fontSize: '14px', fontWeight: 500 }}>Effectiveness rating</label>
            <StarRating
              value={form.effectivenessRating}
              onChange={(rating) => updateField('effectivenessRating', rating)}
            />
          </div>

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

          {/* Submitter */}
          <Input
            label="Your name"
            placeholder="e.g. Jane Doe"
            value={form.submittedBy}
            onChange={(e) => updateField('submittedBy', e.target.value)}
            error={errors.submittedBy}
            required
          />

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
