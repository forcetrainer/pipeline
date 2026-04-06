import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Building2, ExternalLink, Trash2 } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { useToast } from '../../components/ui/ToastContainer';
import { useAuth } from '../../contexts/AuthContext';
import * as assessmentService from '../../services/assessmentService';
import { format } from 'date-fns';
import type { Assessment, AssessmentCheckpoint, AssessmentStatus, CheckpointName, CheckpointStatus } from '../../types';

const statusVariant: Record<AssessmentStatus, 'neutral' | 'info' | 'success' | 'primary'> = {
  draft: 'neutral',
  in_progress: 'info',
  completed: 'success',
  promoted: 'primary',
};

const statusLabel: Record<AssessmentStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  promoted: 'Promoted',
};

const checkpointStatusColor: Record<CheckpointStatus, string> = {
  not_started: 'var(--color-border-strong)',
  pass: 'var(--nx-green-glow)',
  concern: 'var(--nx-amber-glow)',
  fail: 'var(--nx-red-glow)',
};

const checkpointStatusLabel: Record<CheckpointStatus, string> = {
  not_started: 'Not Started',
  pass: 'Pass',
  concern: 'Concern',
  fail: 'Fail',
};

const checkpointDisplayNames: Record<CheckpointName, string> = {
  documentation: 'Documentation & Measurement',
  squint_check: 'The Squint Check',
  auto_manual_switches: 'Automation-to-Manual Switches',
  automation_pyramid: 'Automation Pyramid Level',
  risk_governance: 'Risk & Governance',
};

const CHECKPOINT_ORDER: CheckpointName[] = [
  'documentation',
  'squint_check',
  'auto_manual_switches',
  'automation_pyramid',
  'risk_governance',
];

function getReadinessScore(checkpoints: AssessmentCheckpoint[]): number | null {
  const scored = checkpoints.filter((cp) => cp.score !== null);
  if (scored.length === 0) return null;
  return scored.reduce((sum, cp) => sum + (cp.score ?? 0), 0) / scored.length;
}

function getGrade(score: number): string {
  if (score >= 4.5) return 'S';
  if (score >= 4.0) return 'A';
  if (score >= 3.0) return 'B';
  if (score >= 2.0) return 'C';
  return 'D';
}

const gradeColors: Record<string, string> = {
  S: 'var(--nx-cyan-glow)',
  A: 'var(--nx-green-glow)',
  B: '#3b82f6',
  C: 'var(--nx-amber-glow)',
  D: 'var(--nx-red-glow)',
};

function formatMoney(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 10000) return `$${(value / 1000).toFixed(1)}K`;
  if (value >= 1000) return `$${value.toLocaleString()}`;
  return `$${value}`;
}

function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentUser, isAdmin } = useAuth();
  const [assessment, setAssessment] = useState<(Assessment & { checkpoints: AssessmentCheckpoint[] }) | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await assessmentService.getAssessmentById(id);
        setAssessment(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handlePromote() {
    if (!id) return;
    setPromoting(true);
    try {
      const result = await assessmentService.promoteToUseCase(id);
      if (result) {
        addToast('Assessment promoted to use case! Review and confirm the details.', 'success');
        navigate(`/use-cases/${result.useCase.id}/edit`);
      } else {
        addToast('Failed to promote assessment', 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to promote', 'error');
    } finally {
      setPromoting(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Are you sure you want to delete this assessment? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const success = await assessmentService.deleteAssessment(id);
      if (success) {
        addToast('Assessment deleted', 'success');
        navigate('/assessments');
      } else {
        addToast('Failed to delete assessment', 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20">
      <p style={{ color: 'var(--nx-red-base)' }}>{error}</p>
    </div>
  );

  if (!assessment) {
    return (
      <div className="text-center py-20">
        <h2 style={{ color: 'var(--nx-text-secondary)' }} className="text-xl font-semibold mb-2">
          Assessment not found
        </h2>
        <p style={{ color: 'var(--nx-text-tertiary)' }} className="mb-4">
          The assessment you are looking for does not exist.
        </p>
        <Link to="/assessments">
          <Button variant="secondary">Back to Assessments</Button>
        </Link>
      </div>
    );
  }

  const checkpoints = assessment.checkpoints || [];
  const orderedCheckpoints = CHECKPOINT_ORDER.map(
    (name) => checkpoints.find((cp) => cp.checkpoint === name)
  ).filter(Boolean) as AssessmentCheckpoint[];

  const completedCount = orderedCheckpoints.filter((cp) => cp.status !== 'not_started').length;
  const readinessScore = getReadinessScore(orderedCheckpoints);
  const grade = readinessScore !== null ? getGrade(readinessScore) : null;
  const hasBlocker = orderedCheckpoints.some((cp) => cp.status === 'fail');
  const isOwner = currentUser?.id === assessment.submittedById;
  const canEvaluate = assessment.status !== 'completed' && assessment.status !== 'promoted';
  const canPromote = assessment.status === 'completed' && !assessment.promotedToUseCaseId;
  const canDelete = isOwner || isAdmin;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm mb-6 transition-colors"
        style={{ color: 'var(--nx-text-tertiary)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--nx-text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--nx-text-tertiary)')}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {assessment.title}
          </h1>
          <Badge variant={statusVariant[assessment.status]} size="md">
            {statusLabel[assessment.status]}
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4 text-sm" style={{ color: 'var(--nx-text-tertiary)' }}>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {assessment.submittedBy}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 size={14} />
            {assessment.department}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {format(new Date(assessment.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-xs px-2 py-1 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {assessment.category}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {assessment.aiTool}
          </span>
        </div>

        {/* Promoted link */}
        {assessment.promotedToUseCaseId && (
          <div
            className="flex items-center gap-2 mb-6 px-4 py-3 rounded-lg"
            style={{
              backgroundColor: 'var(--nx-violet-aura)',
              border: '1px solid var(--nx-violet-glow)',
            }}
          >
            <ExternalLink size={14} style={{ color: 'var(--nx-violet-glow)' }} />
            <span style={{ color: 'var(--nx-violet-glow)', fontSize: '14px' }}>
              Promoted to use case:{' '}
              <Link
                to={`/use-cases/${assessment.promotedToUseCaseId}`}
                style={{ textDecoration: 'underline' }}
              >
                View Use Case
              </Link>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          {canEvaluate && (
            <Link to={`/assessments/${assessment.id}/evaluate`}>
              <Button>Evaluate</Button>
            </Link>
          )}
          {canPromote && (
            <Button onClick={handlePromote} isLoading={promoting} variant="secondary">
              Promote to Use Case
            </Button>
          )}
          {canDelete && (
            <Button onClick={handleDelete} isLoading={deleting} variant="secondary">
              <Trash2 size={16} />
              Delete
            </Button>
          )}
        </div>

        {/* Overall Readiness */}
        <div
          className="mb-8"
          style={{
            background: 'var(--nx-glass-medium)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: '12px',
            padding: '1.5rem',
            backdropFilter: 'blur(8px)',
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{
              color: 'var(--nx-text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              letterSpacing: '0.03em',
            }}
          >
            Readiness Overview
          </h2>

          <div className="flex items-center gap-6 mb-6">
            {/* Grade */}
            {grade ? (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: gradeColors[grade],
                    textShadow: `0 0 20px ${gradeColors[grade]}88, 0 0 40px ${gradeColors[grade]}44`,
                  }}
                >
                  {grade}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: gradeColors[grade],
                    fontFamily: 'var(--font-mono)',
                    marginTop: '0.25rem',
                  }}
                >
                  {readinessScore!.toFixed(1)} / 5.0
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--nx-text-tertiary)',
                  }}
                >
                  --
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nx-text-tertiary)', marginTop: '0.25rem' }}>
                  Not scored
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span style={{ fontSize: '13px', color: 'var(--nx-text-secondary)' }}>
                  Progress: {completedCount}/5 checkpoints
                </span>
                {hasBlocker && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: 'var(--nx-red-aura)',
                      color: 'var(--nx-red-glow)',
                      border: '1px solid var(--nx-red-glow)',
                    }}
                  >
                    Blocker Found
                  </span>
                )}
              </div>
              <div
                style={{
                  height: '8px',
                  backgroundColor: 'var(--nx-void-deep)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(completedCount / 5) * 100}%`,
                    backgroundColor: hasBlocker ? 'var(--nx-red-glow)' : 'var(--nx-cyan-base)',
                    borderRadius: '9999px',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Checkpoint bars */}
          <div className="space-y-3">
            {CHECKPOINT_ORDER.map((name) => {
              const cp = orderedCheckpoints.find((c) => c.checkpoint === name);
              const score = cp?.score ?? 0;
              const status = cp?.status ?? 'not_started';

              return (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: '13px', color: 'var(--nx-text-secondary)' }}>
                      {checkpointDisplayNames[name]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs"
                        style={{
                          color: checkpointStatusColor[status],
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {score > 0 ? `${score}/5` : '--'}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${checkpointStatusColor[status]}22`,
                          color: checkpointStatusColor[status],
                          fontSize: '11px',
                        }}
                      >
                        {checkpointStatusLabel[status]}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      backgroundColor: 'var(--nx-void-deep)',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(score / 5) * 100}%`,
                        backgroundColor: checkpointStatusColor[status],
                        borderRadius: '9999px',
                        transition: 'width 300ms ease',
                        boxShadow: score > 0 ? `0 0 6px ${checkpointStatusColor[status]}44` : undefined,
                      }}
                    />
                  </div>
                  {cp?.notes && (
                    <p style={{ fontSize: '12px', color: 'var(--nx-text-tertiary)', marginTop: '4px' }}>
                      {cp.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <section className="mb-6">
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              color: 'var(--nx-text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              letterSpacing: '0.03em',
            }}
          >
            Description
          </h2>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">
            {assessment.description}
          </p>
        </section>

        {/* Estimated Metrics Panel */}
        {assessment.estimatedMetrics && (
          <div
            className="mb-8"
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                color: 'var(--nx-text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                letterSpacing: '0.03em',
              }}
            >
              Estimated Metrics
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              <MetricItem label="Time Saved / Use" value={`${assessment.estimatedMetrics.timeSavedPerUseMinutes} min`} color="var(--nx-green-base)" />
              <MetricItem label="Money Saved / Use" value={formatMoney(assessment.estimatedMetrics.moneySavedPerUse)} color="var(--nx-amber-base)" />
              <MetricItem label="Revenue / Use" value={formatMoney(assessment.estimatedMetrics.revenuePerUse)} color="var(--nx-violet-glow)" />
              <MetricItem label="Users" value={String(assessment.estimatedMetrics.numberOfUsers)} />
              <MetricItem label={`Uses / User / ${assessment.estimatedMetrics.frequencyPeriod === 'daily' ? 'Day' : assessment.estimatedMetrics.frequencyPeriod === 'weekly' ? 'Week' : 'Month'}`} value={String(assessment.estimatedMetrics.usesPerUserPerPeriod)} />
              <MetricItem label="Frequency" value={assessment.estimatedMetrics.frequencyPeriod.charAt(0).toUpperCase() + assessment.estimatedMetrics.frequencyPeriod.slice(1)} color="var(--nx-cyan-base)" />
            </div>
          </div>
        )}

        {/* Estimated Costs Panel */}
        {assessment.estimatedCosts && (assessment.estimatedCosts.totalOneTime > 0 || assessment.estimatedCosts.totalMonthlyRecurring > 0) && (
          <div
            className="mb-8"
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: '12px',
              padding: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                color: 'var(--nx-text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                letterSpacing: '0.03em',
              }}
            >
              Estimated Costs
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
              }}
            >
              <MetricItem label="One-Time Investment" value={formatMoney(assessment.estimatedCosts.totalOneTime)} color="var(--nx-red-glow)" />
              <MetricItem label="Monthly Recurring" value={formatMoney(assessment.estimatedCosts.totalMonthlyRecurring)} color="var(--nx-red-glow)" />
              <MetricItem label="Annual Recurring" value={formatMoney(assessment.estimatedCosts.totalAnnualRecurring)} color="var(--nx-red-glow)" />
            </div>
            {assessment.estimatedCosts.notes && (
              <p style={{ fontSize: '13px', color: 'var(--nx-text-tertiary)', marginTop: '1rem' }}>
                {assessment.estimatedCosts.notes}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {assessment.tags.length > 0 && (
          <div
            className="flex gap-2 flex-wrap pt-4"
            style={{ borderTop: '1px solid var(--nx-cyan-aura)' }}
          >
            {assessment.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-sm"
                style={{ backgroundColor: 'var(--nx-void-elevated)', color: 'var(--nx-text-tertiary)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--nx-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '16px',
          fontWeight: 600,
          color: color || 'var(--nx-text-primary)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default AssessmentDetailPage;
