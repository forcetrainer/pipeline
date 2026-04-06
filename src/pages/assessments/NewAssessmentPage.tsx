import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Input, Textarea, Select, Tag } from '../../components/ui';
import { useToast } from '../../components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import * as assessmentService from '../../services/assessmentService';
import { USE_CASE_CATEGORIES, AI_TOOLS, DEPARTMENTS } from '../../types';

type FormErrors = Partial<Record<string, string>>;

function formatDollarDisplay(value: number): string {
  if (!value) return '';
  return value.toLocaleString('en-US');
}

function parseDollarInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function DollarInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value ? String(value) : '');

  return (
    <div className="flex flex-col gap-1">
      <label style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--nx-text-tertiary)', fontSize: '14px' }}
        >
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={focused ? displayValue : (value ? formatDollarDisplay(value) : '')}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            setDisplayValue(raw);
            onChange(parseDollarInput(raw));
          }}
          onFocus={() => {
            setFocused(true);
            setDisplayValue(value ? String(value) : '');
          }}
          onBlur={() => setFocused(false)}
          placeholder="0"
          className="w-full h-10 pl-7 pr-3 rounded-md transition-colors duration-200"
          style={{
            backgroundColor: 'var(--nx-void-elevated)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--nx-text-primary)',
            outline: 'none',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
}

function NewAssessmentPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [showCosts, setShowCosts] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    aiTool: '',
    department: '',
    tags: [] as string[],
  });

  const [metrics, setMetrics] = useState({
    timeSavedPerUseMinutes: 0,
    moneySavedPerUse: 0,
    revenuePerUse: 0,
    numberOfUsers: 0,
    usesPerUserPerPeriod: 0,
    frequencyPeriod: 'weekly' as 'daily' | 'weekly' | 'monthly',
  });

  const [costs, setCosts] = useState({
    buildCostInternal: 0,
    buildCostExternal: 0,
    licensingOneTime: 0,
    licensingRecurring: 0,
    computeRecurring: 0,
    maintenanceRecurring: 0,
    notes: '',
  });

  const totalOneTime = costs.buildCostInternal + costs.buildCostExternal + costs.licensingOneTime;
  const totalMonthlyRecurring = costs.licensingRecurring + costs.computeRecurring + costs.maintenanceRecurring;
  const totalAnnualRecurring = totalMonthlyRecurring * 12;

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
      const created = await assessmentService.createAssessment({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        aiTool: form.aiTool || 'Other',
        department: form.department || 'Other',
        tags: form.tags,
        estimatedMetrics: metrics,
        estimatedCosts: {
          ...costs,
          totalOneTime,
          totalMonthlyRecurring,
          totalAnnualRecurring,
        },
      });
      addToast('Assessment created successfully!', 'success');
      navigate(`/assessments/${created.id}/evaluate`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to create assessment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = USE_CASE_CATEGORIES.map((c) => ({ value: c, label: c }));
  const aiToolOptions = AI_TOOLS.map((t) => ({ value: t, label: t }));
  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));

  return (
    <div>
      <Link
        to="/assessments"
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back to Assessments
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
          New Assessment
        </h1>
        <p style={{ color: 'var(--nx-text-secondary)' }} className="mb-2">
          Evaluate whether a process is ready for automation.
        </p>
        {currentUser && (
          <p style={{ color: 'var(--nx-text-tertiary)' }} className="text-sm mb-8">
            Creating as{' '}
            <span style={{ color: 'var(--nx-cyan-base)' }}>
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Title"
            placeholder="e.g. Invoice Processing Automation"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            error={errors.title}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe the process you want to assess for automation readiness..."
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            error={errors.description}
            rows={4}
            required
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

          <Select
            label="Team"
            options={departmentOptions}
            value={form.department}
            onChange={(e) => updateField('department', e.target.value)}
            placeholder="Select your team"
          />

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: 'var(--nx-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
              Tags
            </label>
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
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-1">
                {form.tags.map((tag) => (
                  <Tag key={tag} onRemove={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          {/* Estimated Metrics */}
          <div
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h3
              className="text-sm font-semibold mb-4"
              style={{
                color: 'var(--nx-text-primary)',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.03em',
              }}
            >
              Estimated Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  Time saved per use (minutes)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={metrics.timeSavedPerUseMinutes || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setMetrics((prev) => ({ ...prev, timeSavedPerUseMinutes: parseFloat(val) || 0 }));
                  }}
                  placeholder="0"
                  className="h-10 px-3 rounded-md"
                  style={{
                    backgroundColor: 'var(--nx-void-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--nx-text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
              <DollarInput
                label="Money saved per use ($)"
                value={metrics.moneySavedPerUse}
                onChange={(val) => setMetrics((prev) => ({ ...prev, moneySavedPerUse: val }))}
              />
              <DollarInput
                label="Revenue per use ($)"
                value={metrics.revenuePerUse}
                onChange={(val) => setMetrics((prev) => ({ ...prev, revenuePerUse: val }))}
              />
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
              style={{ borderTop: '1px solid var(--nx-cyan-aura)', paddingTop: '1rem' }}
            >
              <div className="flex flex-col gap-1">
                <label style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  Number of users
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={metrics.numberOfUsers || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setMetrics((prev) => ({ ...prev, numberOfUsers: parseInt(val) || 0 }));
                  }}
                  placeholder="0"
                  className="h-10 px-3 rounded-md"
                  style={{
                    backgroundColor: 'var(--nx-void-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--nx-text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  Uses per user per period
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={metrics.usesPerUserPerPeriod || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setMetrics((prev) => ({ ...prev, usesPerUserPerPeriod: parseFloat(val) || 0 }));
                  }}
                  placeholder="0"
                  className="h-10 px-3 rounded-md"
                  style={{
                    backgroundColor: 'var(--nx-void-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--nx-text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ color: 'var(--nx-text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  Frequency period
                </label>
                <select
                  value={metrics.frequencyPeriod}
                  onChange={(e) =>
                    setMetrics((prev) => ({
                      ...prev,
                      frequencyPeriod: e.target.value as 'daily' | 'weekly' | 'monthly',
                    }))
                  }
                  className="h-10 px-3 rounded-md"
                  style={{
                    backgroundColor: 'var(--nx-void-elevated)',
                    border: '1px solid var(--color-border-default)',
                    color: 'var(--nx-text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estimated Costs (collapsible) */}
          <div
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowCosts(!showCosts)}
              className="flex items-center gap-2 w-full text-left"
            >
              {showCosts ? (
                <ChevronDown size={16} style={{ color: 'var(--nx-cyan-base)' }} />
              ) : (
                <ChevronRight size={16} style={{ color: 'var(--nx-text-tertiary)' }} />
              )}
              <h3
                className="text-sm font-semibold"
                style={{
                  color: 'var(--nx-text-primary)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                }}
              >
                Estimated Costs
              </h3>
              {(totalOneTime > 0 || totalMonthlyRecurring > 0) && (
                <span
                  className="ml-auto text-xs"
                  style={{ color: 'var(--nx-text-tertiary)', fontFamily: 'var(--font-mono)' }}
                >
                  ${totalOneTime.toLocaleString()} one-time + ${totalMonthlyRecurring.toLocaleString()}/mo
                </span>
              )}
            </button>

            {showCosts && (
              <div className="mt-4 space-y-4">
                {/* One-time costs */}
                <div>
                  <p
                    className="text-xs mb-3"
                    style={{
                      color: 'var(--nx-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 500,
                    }}
                  >
                    One-Time Costs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DollarInput
                      label="Build cost (internal)"
                      value={costs.buildCostInternal}
                      onChange={(val) => setCosts((prev) => ({ ...prev, buildCostInternal: val }))}
                    />
                    <DollarInput
                      label="Build cost (external)"
                      value={costs.buildCostExternal}
                      onChange={(val) => setCosts((prev) => ({ ...prev, buildCostExternal: val }))}
                    />
                    <DollarInput
                      label="Licensing (one-time)"
                      value={costs.licensingOneTime}
                      onChange={(val) => setCosts((prev) => ({ ...prev, licensingOneTime: val }))}
                    />
                  </div>
                </div>

                {/* Recurring costs */}
                <div>
                  <p
                    className="text-xs mb-3"
                    style={{
                      color: 'var(--nx-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontWeight: 500,
                    }}
                  >
                    Recurring Monthly Costs
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <DollarInput
                      label="Licensing"
                      value={costs.licensingRecurring}
                      onChange={(val) => setCosts((prev) => ({ ...prev, licensingRecurring: val }))}
                    />
                    <DollarInput
                      label="Compute / API"
                      value={costs.computeRecurring}
                      onChange={(val) => setCosts((prev) => ({ ...prev, computeRecurring: val }))}
                    />
                    <DollarInput
                      label="Maintenance"
                      value={costs.maintenanceRecurring}
                      onChange={(val) => setCosts((prev) => ({ ...prev, maintenanceRecurring: val }))}
                    />
                  </div>
                </div>

                {/* Totals */}
                <div
                  className="flex gap-6 pt-3"
                  style={{ borderTop: '1px solid var(--nx-cyan-aura)' }}
                >
                  <div>
                    <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>
                      Total One-Time
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--nx-text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      ${totalOneTime.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>
                      Total Monthly
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--nx-text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      ${totalMonthlyRecurring.toLocaleString()}/mo
                    </p>
                  </div>
                  <div>
                    <span className="text-xs" style={{ color: 'var(--nx-text-tertiary)' }}>
                      Total Annual
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--nx-text-primary)', fontFamily: 'var(--font-mono)' }}
                    >
                      ${totalAnnualRecurring.toLocaleString()}/yr
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <Textarea
                  label="Cost Notes"
                  placeholder="Any context about cost estimates..."
                  value={costs.notes}
                  onChange={(e) => setCosts((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              Create & Start Evaluation
            </Button>
            <Link to="/assessments">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewAssessmentPage;
