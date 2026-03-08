import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Building2 } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import * as useCaseService from '../services/useCaseService';
import { format } from 'date-fns';
import type { UseCase, ScoreGrade, CostTracking } from '../types';
import { calculateScore, calculateROI, formatTime, formatMoney } from '../utils/metricsCalculator';

const impactVariant = {
  high: 'success' as const,
  medium: 'warning' as const,
  low: 'neutral' as const,
};

const statusVariant = {
  active: 'success' as const,
  pilot: 'warning' as const,
  idea: 'info' as const,
  archived: 'neutral' as const,
};

function UseCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [useCase, setUseCase] = useState<UseCase | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const data = await useCaseService.getUseCaseById(id);
        setUseCase(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load use case');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

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

  if (!useCase) {
    return (
      <div className="text-center py-20">
        <h2 style={{ color: 'var(--nx-text-secondary)' }} className="text-xl font-semibold mb-2">Use case not found</h2>
        <p style={{ color: 'var(--nx-text-tertiary)' }} className="mb-4">The use case you're looking for doesn't exist.</p>
        <Link to="/use-cases">
          <Button variant="secondary">Back to Use Cases</Button>
        </Link>
      </div>
    );
  }

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
        <div className="flex items-start justify-between mb-4">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: 'var(--nx-text-primary)',
              letterSpacing: '0.05em',
            }}
          >
            {useCase.title}
          </h1>
          <Badge variant={statusVariant[useCase.status]} size="md">{useCase.status}</Badge>
        </div>

        <div className="flex items-center gap-4 mb-6 text-sm" style={{ color: 'var(--nx-text-tertiary)' }}>
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {useCase.submittedBy}
          </span>
          <span className="flex items-center gap-1.5">
            <Building2 size={14} />
            {useCase.department}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {format(new Date(useCase.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Badge variant={impactVariant[useCase.impact]} size="md">{useCase.impact} impact</Badge>
          <Badge variant={impactVariant[useCase.effort]} size="md">{useCase.effort} effort</Badge>
          <button
            disabled
            className="opacity-50 cursor-not-allowed px-3 py-1 rounded-md text-xs font-medium"
            style={{
              backgroundColor: 'var(--nx-void-surface)',
              color: 'var(--nx-text-tertiary)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title="AI Readiness Check coming soon"
          >
            Check AI Readiness (Coming Soon)
          </button>
          <span
            className="text-xs px-2 py-1 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {useCase.category}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-sm"
            style={{ backgroundColor: 'var(--nx-void-surface)', color: 'var(--nx-text-secondary)' }}
          >
            {useCase.aiTool}
          </span>
        </div>

        {/* Metrics Breakdown Panel */}
        {useCase.metrics && (useCase.metrics.timeSavedHours > 0 || useCase.metrics.moneySavedDollars > 0 || (useCase.metrics.revenuePerUse || 0) > 0) && (
          <MetricsBreakdown metrics={useCase.metrics} />
        )}

        {/* Cost & ROI Panel */}
        {useCase.actualCosts && (
          <CostAndROIPanel metrics={useCase.metrics} costs={useCase.actualCosts} />
        )}

        {/* Description */}
        <section className="mb-6">
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '16px', letterSpacing: '0.03em' }}
          >
            Description
          </h2>
          <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">{useCase.description}</p>
        </section>

        {/* What Was Built */}
        {useCase.whatWasBuilt && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '16px', letterSpacing: '0.03em' }}
            >
              What Was Built
            </h2>
            <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">{useCase.whatWasBuilt}</p>
          </section>
        )}

        {/* Key Learnings */}
        {useCase.keyLearnings && (
          <section className="mb-6">
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--nx-text-primary)', fontFamily: "'Orbitron', sans-serif", fontSize: '16px', letterSpacing: '0.03em' }}
            >
              Key Learnings
            </h2>
            <p style={{ color: 'var(--nx-text-secondary)' }} className="leading-relaxed whitespace-pre-wrap">{useCase.keyLearnings}</p>
          </section>
        )}

        {/* Tags */}
        {useCase.tags.length > 0 && (
          <div
            className="flex gap-2 flex-wrap pt-4"
            style={{ borderTop: '1px solid rgba(0, 212, 255, 0.1)' }}
          >
            {useCase.tags.map((tag) => (
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

const gradeColors: Record<ScoreGrade, string> = {
  S: '#00d4ff',
  A: '#00ff88',
  B: '#3b82f6',
  C: '#ffaa00',
  D: '#ff3366',
};

const quadrantLabels: Record<string, string> = {
  'high-value-high-scale': 'Force Multiplier',
  'high-value-low-scale': 'Hidden Gem',
  'low-value-high-scale': 'Power Tool',
  'low-value-low-scale': 'Emerging',
};

function MetricsBreakdown({ metrics }: { metrics: import('../types').UseCaseMetrics }) {
  const score = calculateScore(metrics);
  const hasPerUse = metrics.timeSavedPerUseMinutes > 0 || metrics.moneySavedPerUse > 0 || (metrics.revenuePerUse || 0) > 0;
  const hasScale = metrics.numberOfUsers > 0 && metrics.usesPerUserPerPeriod > 0;
  const hasRevenue = (metrics.revenuePerUse || 0) > 0;

  const projections = [
    {
      label: 'Daily',
      time: formatTime(metrics.dailyTimeSavedMinutes),
      money: formatMoney(metrics.dailyMoneySaved),
      revenue: formatMoney(metrics.dailyRevenue || 0),
      isAnnual: false,
    },
    {
      label: 'Weekly',
      time: formatTime(metrics.weeklyTimeSavedMinutes),
      money: formatMoney(metrics.weeklyMoneySaved),
      revenue: formatMoney(metrics.weeklyRevenue || 0),
      isAnnual: false,
    },
    {
      label: 'Monthly',
      time: formatTime(metrics.monthlyTimeSavedHours * 60),
      money: formatMoney(metrics.monthlyMoneySaved),
      revenue: formatMoney(metrics.monthlyRevenue || 0),
      isAnnual: false,
    },
    {
      label: 'Annual',
      time: formatTime(metrics.annualTimeSavedHours * 60),
      money: formatMoney(metrics.annualMoneySaved),
      revenue: formatMoney(metrics.annualRevenue || 0),
      isAnnual: true,
    },
  ];

  return (
    <div
      className="mb-8"
      style={{
        background: 'var(--nx-glass-medium)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.5rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{
          color: 'var(--nx-text-primary)',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '16px',
          letterSpacing: '0.03em',
        }}
      >
        Metrics & Impact
      </h2>

      {/* Per-use savings */}
      {hasPerUse && (
        <div className="mb-4">
          <p style={{ fontSize: '13px', color: 'var(--nx-text-tertiary)', marginBottom: '0.25rem' }}>
            Per-use savings
          </p>
          <p style={{ fontSize: '16px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--nx-text-primary)' }}>
            {(metrics.timeSavedPerUseMinutes > 0 || metrics.moneySavedPerUse > 0) && 'Saves '}
            {metrics.timeSavedPerUseMinutes > 0 && (
              <span style={{ color: 'var(--nx-green-base)' }}>
                {formatTime(metrics.timeSavedPerUseMinutes)}
              </span>
            )}
            {metrics.timeSavedPerUseMinutes > 0 && metrics.moneySavedPerUse > 0 && ' and '}
            {metrics.moneySavedPerUse > 0 && (
              <span style={{ color: 'var(--nx-amber-base)' }}>
                {formatMoney(metrics.moneySavedPerUse)}
              </span>
            )}
            {(metrics.timeSavedPerUseMinutes > 0 || metrics.moneySavedPerUse > 0) && hasRevenue && ' · '}
            {hasRevenue && (
              <>
                generates{' '}
                <span style={{ color: '#a78bfa' }}>
                  {formatMoney(metrics.revenuePerUse)}
                </span>
              </>
            )}
            {' '}per use
          </p>
        </div>
      )}

      {/* Scale */}
      {hasScale && (
        <div className="mb-5">
          <p style={{ fontSize: '13px', color: 'var(--nx-text-tertiary)', marginBottom: '0.25rem' }}>
            Scale
          </p>
          <p style={{ fontSize: '14px', color: 'var(--nx-text-secondary)' }}>
            Used by <strong style={{ color: 'var(--nx-text-primary)' }}>{metrics.numberOfUsers}</strong> people,{' '}
            <strong style={{ color: 'var(--nx-text-primary)' }}>{metrics.usesPerUserPerPeriod}</strong> times per{' '}
            {metrics.frequencyPeriod === 'daily' ? 'day' : metrics.frequencyPeriod === 'weekly' ? 'week' : 'month'}
          </p>
        </div>
      )}

      {/* Projected savings grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr 1fr 1fr 1.3fr',
          gap: '0.5rem 0.75rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}
      >
        {/* Header row */}
        <div />
        {projections.map((p) => (
          <div
            key={p.label}
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-sans)',
              color: p.isAnnual ? 'var(--nx-cyan-base)' : 'var(--nx-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: p.isAnnual ? 600 : 500,
              paddingBottom: '0.5rem',
              borderBottom: p.isAnnual
                ? '1px solid rgba(0, 212, 255, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {p.label}
          </div>
        ))}

        {/* Time row */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--nx-green-base)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'left',
            alignSelf: 'center',
          }}
        >
          Time
        </div>
        {projections.map((p) => (
          <div
            key={`time-${p.label}`}
            style={{
              fontFamily: p.isAnnual ? "'Orbitron', sans-serif" : "'JetBrains Mono', monospace",
              fontSize: p.isAnnual ? '18px' : '14px',
              fontWeight: p.isAnnual ? 600 : 500,
              color: 'var(--nx-green-base)',
              padding: '0.375rem 0',
              textShadow: p.isAnnual ? '0 0 12px rgba(0, 255, 136, 0.5)' : undefined,
            }}
          >
            {p.time}
          </div>
        ))}

        {/* Money row */}
        <div
          style={{
            fontSize: '11px',
            color: 'var(--nx-amber-base)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'left',
            alignSelf: 'center',
          }}
        >
          Money
        </div>
        {projections.map((p) => (
          <div
            key={`money-${p.label}`}
            style={{
              fontFamily: p.isAnnual ? "'Orbitron', sans-serif" : "'JetBrains Mono', monospace",
              fontSize: p.isAnnual ? '18px' : '14px',
              fontWeight: p.isAnnual ? 600 : 500,
              color: 'var(--nx-amber-base)',
              padding: '0.375rem 0',
              textShadow: p.isAnnual ? '0 0 12px rgba(255, 170, 0, 0.5)' : undefined,
            }}
          >
            {p.money}
          </div>
        ))}

        {/* Revenue row (hidden when zero) */}
        {hasRevenue && (
          <>
            <div
              style={{
                fontSize: '11px',
                color: '#a78bfa',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textAlign: 'left',
                alignSelf: 'center',
              }}
            >
              Revenue
            </div>
            {projections.map((p) => (
              <div
                key={`revenue-${p.label}`}
                style={{
                  fontFamily: p.isAnnual ? "'Orbitron', sans-serif" : "'JetBrains Mono', monospace",
                  fontSize: p.isAnnual ? '18px' : '14px',
                  fontWeight: p.isAnnual ? 600 : 500,
                  color: '#a78bfa',
                  padding: '0.375rem 0',
                  textShadow: p.isAnnual ? '0 0 12px rgba(167, 139, 250, 0.5)' : undefined,
                }}
              >
                {p.revenue}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Impact Score */}
      {score.overallScore > 0 && (
        <div
          style={{
            borderTop: '1px solid rgba(0, 212, 255, 0.15)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {/* Grade badge */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '2.5rem',
                fontWeight: 700,
                lineHeight: 1,
                color: gradeColors[score.grade],
                textShadow: `0 0 20px ${gradeColors[score.grade]}88, 0 0 40px ${gradeColors[score.grade]}44`,
              }}
            >
              {score.grade}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: gradeColors[score.grade],
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                marginTop: '0.25rem',
                whiteSpace: 'nowrap',
                opacity: 0.85,
              }}
            >
              {quadrantLabels[score.quadrant] || score.quadrant}
            </div>
          </div>

          {/* Score bars */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Value bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--nx-text-tertiary)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Value
                </span>
                <span style={{ fontSize: '11px', color: 'var(--nx-green-base)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                  {Math.round(score.valuePerUse)}
                </span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--nx-void-deep)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, Math.round(score.valuePerUse)))}%`,
                    backgroundColor: 'var(--nx-green-base)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 8px rgba(0, 255, 136, 0.3)',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>
            {/* Scale bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--nx-text-tertiary)', fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scale
                </span>
                <span style={{ fontSize: '11px', color: 'var(--nx-cyan-base)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                  {Math.round(score.scaleFactor)}
                </span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--nx-void-deep)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, Math.round(score.scaleFactor)))}%`,
                    backgroundColor: 'var(--nx-cyan-base)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CostAndROIPanel({ metrics, costs }: { metrics: import('../types').UseCaseMetrics; costs: CostTracking }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const roi = calculateROI(metrics, costs);

  const paybackColor =
    roi.paybackPeriodMonths === null
      ? '#ff6b6b'
      : roi.paybackPeriodMonths < 12
        ? 'var(--nx-green-base)'
        : roi.paybackPeriodMonths <= 24
          ? 'var(--nx-amber-base)'
          : '#ff6b6b';

  const roiColor = (value: number | null) =>
    value === null ? 'var(--nx-text-tertiary)' : value >= 0 ? 'var(--nx-green-base)' : '#ff6b6b';

  const hasRevenue = roi.annualRevenue > 0;
  const netValueColor = roi.netAnnualValue >= 0 ? 'var(--nx-green-base)' : '#ff6b6b';

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    color: 'var(--nx-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    marginBottom: '0.25rem',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '18px',
    fontWeight: 600,
  };

  const costItems = [
    { label: 'Internal build', value: costs.buildCostInternal },
    { label: 'External build', value: costs.buildCostExternal },
    { label: 'One-time licensing', value: costs.licensingOneTime },
    { label: 'Monthly licensing', value: costs.licensingRecurring },
    { label: 'Monthly compute/API', value: costs.computeRecurring },
    { label: 'Monthly maintenance', value: costs.maintenanceRecurring },
  ];

  return (
    <div
      className="mb-8"
      style={{
        background: 'var(--nx-glass-medium)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.5rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{
          color: 'var(--nx-text-primary)',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '16px',
          letterSpacing: '0.03em',
        }}
      >
        Cost & ROI
      </h2>

      {/* Row 1: Cost breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>One-Time Investment</div>
          <div style={{ ...valueStyle, color: '#ff6b6b', textShadow: '0 0 12px rgba(255, 107, 107, 0.5)' }}>
            {formatMoney(roi.totalInvestment)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Monthly Recurring</div>
          <div style={{ ...valueStyle, color: '#ff6b6b', textShadow: '0 0 12px rgba(255, 107, 107, 0.5)' }}>
            {formatMoney(costs.totalMonthlyRecurring)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Annual Recurring</div>
          <div style={{ ...valueStyle, color: '#ff6b6b', textShadow: '0 0 12px rgba(255, 107, 107, 0.5)' }}>
            {formatMoney(costs.totalAnnualRecurring)}
          </div>
        </div>
      </div>

      {/* Row 2: ROI metrics */}
      <div
        style={{
          borderTop: '1px solid rgba(0, 212, 255, 0.15)',
          paddingTop: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>{hasRevenue ? 'Net Annual Value' : 'Net Annual Savings'}</div>
          <div style={{ ...valueStyle, color: netValueColor, textShadow: `0 0 12px ${netValueColor}88` }}>
            {formatMoney(roi.netAnnualValue)}
          </div>
          {hasRevenue && (
            <div style={{ fontSize: '10px', color: 'var(--nx-text-ghost)', marginTop: '0.25rem', fontFamily: 'var(--font-sans)' }}>
              {formatMoney(roi.grossAnnualSavings)} savings + {formatMoney(roi.annualRevenue)} revenue − {formatMoney(costs.totalAnnualRecurring)} costs
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Payback Period</div>
          <div style={{ ...valueStyle, color: paybackColor, textShadow: `0 0 12px ${paybackColor}88` }}>
            {roi.paybackPeriodMonths !== null
              ? `${roi.paybackPeriodMonths.toFixed(1)} months`
              : 'N/A'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>First Year ROI</div>
          <div style={{ ...valueStyle, color: roiColor(roi.firstYearROI), textShadow: `0 0 12px ${roiColor(roi.firstYearROI)}88` }}>
            {roi.firstYearROI !== null ? `${Math.round(roi.firstYearROI).toLocaleString()}%` : 'N/A'}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Ongoing ROI</div>
          <div style={{ ...valueStyle, color: roiColor(roi.ongoingROI), textShadow: `0 0 12px ${roiColor(roi.ongoingROI)}88` }}>
            {roi.ongoingROI !== null ? `${Math.round(roi.ongoingROI).toLocaleString()}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Expandable cost detail */}
      <div style={{ marginTop: '1rem' }}>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--nx-text-tertiary)',
            fontSize: '12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            padding: '0.25rem 0',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          {showBreakdown ? 'Hide cost breakdown' : 'Show cost breakdown'}
        </button>

        {showBreakdown && (
          <div
            style={{
              marginTop: '0.75rem',
              padding: '1rem',
              background: 'var(--nx-void-surface)',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem 2rem',
            }}
          >
            {costItems.map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--nx-text-tertiary)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--nx-text-secondary)' }}>
                  {formatMoney(item.value)}
                </span>
              </div>
            ))}
            {costs.notes && (
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '11px', color: 'var(--nx-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Notes</span>
                <p style={{ fontSize: '13px', color: 'var(--nx-text-secondary)', marginTop: '0.25rem' }}>{costs.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UseCaseDetailPage;
