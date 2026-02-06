import { type FormEvent, useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import type { Prompt } from '../../types';

interface PromptFormProps {
  initialData?: Partial<Prompt>;
  onSubmit: (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>) => void;
  isSubmitting?: boolean;
}

const categoryOptions = [
  { value: 'Writing', label: 'Writing' },
  { value: 'Coding', label: 'Coding' },
  { value: 'Analysis', label: 'Analysis' },
  { value: 'Research', label: 'Research' },
  { value: 'Creative', label: 'Creative' },
  { value: 'Communication', label: 'Communication' },
  { value: 'Other', label: 'Other' },
];

const aiToolOptions = [
  { value: 'ChatGPT', label: 'ChatGPT' },
  { value: 'Claude', label: 'Claude' },
  { value: 'Copilot', label: 'GitHub Copilot' },
  { value: 'Gemini', label: 'Gemini' },
  { value: 'Any', label: 'Any / Universal' },
  { value: 'Other', label: 'Other' },
];

function PromptForm({ initialData, onSubmit, isSubmitting }: PromptFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [aiTool, setAiTool] = useState(initialData?.aiTool || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [submittedBy, setSubmittedBy] = useState(initialData?.submittedBy || '');
  const [effectiveness, setEffectiveness] = useState(initialData?.effectivenessRating || 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      content,
      problemBeingSolved: '',
      effectivenessRating: effectiveness,
      tips: '',
      category,
      aiTool,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      submittedBy,
    });
  };

  /** Colour for the effectiveness track fill */
  const effectivenessColor =
    effectiveness >= 8
      ? 'var(--nx-green-base)'
      : effectiveness >= 5
        ? 'var(--nx-amber-base)'
        : effectiveness > 0
          ? 'var(--nx-red-base)'
          : 'var(--nx-text-ghost)';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl rounded-lg p-6"
      style={{
        backgroundColor: 'var(--nx-void-panel)',
        border: '1px solid rgba(168, 85, 247, 0.15)',
      }}
    >
      {/* Section label */}
      <div
        className="pb-4"
        style={{ borderBottom: '1px solid rgba(168, 85, 247, 0.1)' }}
      >
        <h2
          className="text-lg font-semibold tracking-wide uppercase"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--nx-text-primary)',
          }}
        >
          {initialData?.title ? 'Edit Prompt' : 'New Prompt'}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--nx-text-tertiary)' }}>
          Share a prompt with the team
        </p>
      </div>

      <Input
        label="Title"
        placeholder="e.g., Code Review Feedback Generator"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        label="Description"
        placeholder="When should someone use this prompt? What problem does it solve?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        required
      />

      {/* Prompt content textarea - JetBrains Mono / code-like */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="prompt-content"
          className="text-sm font-medium text-neutral-100 tracking-wide uppercase"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Prompt Content
        </label>
        <textarea
          id="prompt-content"
          placeholder="Paste the full prompt text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
          className="
            w-full px-3 py-2 min-h-[80px]
            border rounded-md
            text-neutral-50
            placeholder:text-neutral-400
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-primary-500
            disabled:opacity-50 disabled:bg-neutral-900
            resize-y border-neutral-500
          "
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-relaxed)',
            backgroundColor: 'var(--nx-void-deep)',
            color: 'var(--nx-violet-bright)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nx-glow-violet)';
            e.currentTarget.style.borderColor = 'var(--nx-violet-base)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.borderColor = '';
          }}
        />
      </div>

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
          placeholder="Best used with..."
          value={aiTool}
          onChange={(e) => setAiTool(e.target.value)}
          required
        />
      </div>

      {/* Effectiveness slider with coloured track */}
      <div className="flex flex-col gap-1.5">
        <label
          className="text-sm font-medium text-neutral-100 tracking-wide uppercase"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          Effectiveness ({effectiveness}/10)
        </label>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={effectiveness}
            onChange={(e) => setEffectiveness(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${effectivenessColor} ${effectiveness * 10}%, var(--nx-void-elevated) ${effectiveness * 10}%)`,
              accentColor: effectivenessColor,
            }}
          />
          {/* Track labels */}
          <div className="flex justify-between mt-1">
            <span className="text-xs" style={{ color: 'var(--nx-text-ghost)' }}>0</span>
            <span className="text-xs" style={{ color: 'var(--nx-text-ghost)' }}>10</span>
          </div>
        </div>
      </div>

      <Input
        label="Tags"
        placeholder="Comma-separated tags, e.g., productivity, code, review"
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

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isSubmitting}>
          {initialData?.title ? 'Update Prompt' : 'Share Prompt'}
        </Button>
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export { PromptForm };
