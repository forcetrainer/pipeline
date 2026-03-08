import { useState, useMemo, useCallback, useRef } from 'react';
import type { UseCaseMetrics, FrequencyPeriod, UseCaseScore, ScoreGrade } from '../../types';
import {
  calculateMetrics,
  calculateScore,
  formatTime,
  formatMoney,
} from '../../utils/metricsCalculator';

interface MetricsCalculatorProps {
  value: UseCaseMetrics;
  onChange: (metrics: UseCaseMetrics) => void;
}

type TimeUnit = 'minutes' | 'hours';

const frequencyOptions: { value: FrequencyPeriod; label: string }[] = [
  { value: 'daily', label: 'per day' },
  { value: 'weekly', label: 'per week' },
  { value: 'monthly', label: 'per month' },
];

const gradeColors: Record<ScoreGrade, string> = {
  S: '#00d4ff',
  A: '#00ff88',
  B: '#3b82f6',
  C: '#ffaa00',
  D: '#ff3366',
};

const quadrantLabels: Record<UseCaseScore['quadrant'], string> = {
  'high-value-high-scale': 'Force Multiplier',
  'high-value-low-scale': 'Hidden Gem',
  'low-value-high-scale': 'Power Tool',
  'low-value-low-scale': 'Emerging',
};

// --- Shared styles ---

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--nx-text-tertiary)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
  marginBottom: '0.75rem',
};

const helperTextStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--nx-text-ghost)',
  marginTop: '0.25rem',
};

const inputBaseStyle: React.CSSProperties = {
  height: '2.5rem',
  width: '100%',
  padding: '0 0.75rem',
  border: '1px solid rgba(0, 212, 255, 0.15)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--nx-void-elevated)',
  color: 'var(--nx-text-primary)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  outline: 'none',
  transition: 'box-shadow 200ms ease, border-color 200ms ease',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
  color: 'var(--nx-text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  fontFamily: 'var(--font-sans)',
  marginBottom: '0.375rem',
  display: 'block',
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.boxShadow = 'var(--nx-glow-cyan)';
  e.currentTarget.style.borderColor = 'var(--nx-cyan-base)';
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.boxShadow = '';
  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)';
}

function formatWithCommas(num: number): string {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// --- Component ---

function MetricsCalculator({ value, onChange }: MetricsCalculatorProps) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('minutes');
  const [moneyFocused, setMoneyFocused] = useState(false);
  const [moneyRaw, setMoneyRaw] = useState('');

  // Derive raw input values from the metrics value prop
  const timeSavedPerUseMinutes = value.timeSavedPerUseMinutes || 0;
  const moneySavedPerUse = value.moneySavedPerUse || 0;
  const numberOfUsers = value.numberOfUsers || 0;
  const usesPerUserPerPeriod = value.usesPerUserPerPeriod || 0;
  const frequencyPeriod = value.frequencyPeriod || 'daily';

  const hasAnyValue =
    timeSavedPerUseMinutes > 0 ||
    moneySavedPerUse > 0 ||
    numberOfUsers > 0 ||
    usesPerUserPerPeriod > 0;

  const hasMetrics =
    (timeSavedPerUseMinutes > 0 || moneySavedPerUse > 0) &&
    numberOfUsers > 0 &&
    usesPerUserPerPeriod > 0;

  const score = useMemo(() => {
    if (!hasMetrics) return null;
    return calculateScore(value);
  }, [value, hasMetrics]);

  const recalc = useCallback(
    (overrides: Partial<{
      timeSavedPerUseMinutes: number;
      moneySavedPerUse: number;
      numberOfUsers: number;
      usesPerUserPerPeriod: number;
      frequencyPeriod: FrequencyPeriod;
    }>) => {
      const input = {
        timeSavedPerUseMinutes: overrides.timeSavedPerUseMinutes ?? timeSavedPerUseMinutes,
        moneySavedPerUse: overrides.moneySavedPerUse ?? moneySavedPerUse,
        numberOfUsers: overrides.numberOfUsers ?? numberOfUsers,
        usesPerUserPerPeriod: overrides.usesPerUserPerPeriod ?? usesPerUserPerPeriod,
        frequencyPeriod: overrides.frequencyPeriod ?? frequencyPeriod,
      };
      onChange(calculateMetrics(input));
    },
    [timeSavedPerUseMinutes, moneySavedPerUse, numberOfUsers, usesPerUserPerPeriod, frequencyPeriod, onChange]
  );

  // Display value for time input depending on unit toggle
  const displayTimeValue =
    timeUnit === 'hours'
      ? timeSavedPerUseMinutes > 0
        ? parseFloat((timeSavedPerUseMinutes / 60).toFixed(2))
        : ''
      : timeSavedPerUseMinutes > 0
        ? timeSavedPerUseMinutes
        : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Section 1: Per-Use Savings */}
      <section>
        <h3 style={sectionHeaderStyle}>Per-Use Savings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Time saved per use */}
          <div>
            <label style={labelStyle}>Time saved per use</label>
            <div style={{ display: 'flex', gap: '0' }}>
              <input
                type="number"
                min="0"
                step={timeUnit === 'hours' ? '0.25' : '1'}
                placeholder="0"
                value={displayTimeValue}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value) || 0;
                  const minutes = timeUnit === 'hours' ? raw * 60 : raw;
                  recalc({ timeSavedPerUseMinutes: minutes });
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                  ...inputBaseStyle,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  flex: 1,
                }}
              />
              <button
                type="button"
                onClick={() => setTimeUnit(timeUnit === 'minutes' ? 'hours' : 'minutes')}
                style={{
                  height: '2.5rem',
                  padding: '0 0.625rem',
                  backgroundColor: 'var(--nx-void-surface)',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  borderTopRightRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  color: 'var(--nx-cyan-base)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 150ms ease',
                }}
              >
                {timeUnit === 'minutes' ? 'min' : 'hrs'}
              </button>
            </div>
          </div>

          {/* Money saved per use */}
          <div>
            <label style={labelStyle}>Money saved per use</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--nx-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  pointerEvents: 'none',
                }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={moneySavedPerUse > 0
                  ? (moneyFocused ? moneyRaw : formatWithCommas(moneySavedPerUse))
                  : (moneyFocused ? moneyRaw : '')}
                onChange={(e) => {
                  const stripped = e.target.value.replace(/,/g, '');
                  const cleaned = stripped.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
                  setMoneyRaw(sanitized);
                  recalc({ moneySavedPerUse: parseFloat(sanitized) || 0 });
                }}
                onFocus={(e) => {
                  setMoneyFocused(true);
                  setMoneyRaw(moneySavedPerUse > 0 ? moneySavedPerUse.toString() : '');
                  handleFocus(e);
                }}
                onBlur={(e) => {
                  setMoneyFocused(false);
                  setMoneyRaw('');
                  handleBlur(e);
                }}
                style={{
                  ...inputBaseStyle,
                  paddingLeft: '1.5rem',
                }}
              />
            </div>
          </div>
        </div>
        <p style={helperTextStyle}>How much is saved each time someone uses this?</p>
      </section>

      {/* Section 2: Scale */}
      <section>
        <h3 style={sectionHeaderStyle}>Scale</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Number of users */}
          <div>
            <label style={labelStyle}>Number of users</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={numberOfUsers > 0 ? numberOfUsers : ''}
              onChange={(e) => {
                recalc({ numberOfUsers: parseInt(e.target.value, 10) || 0 });
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputBaseStyle}
            />
          </div>

          {/* Usage frequency */}
          <div>
            <label style={labelStyle}>Usage frequency</label>
            <div style={{ display: 'flex', gap: '0' }}>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={usesPerUserPerPeriod > 0 ? usesPerUserPerPeriod : ''}
                onChange={(e) => {
                  recalc({ usesPerUserPerPeriod: parseInt(e.target.value, 10) || 0 });
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                  ...inputBaseStyle,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  flex: 1,
                }}
              />
              <select
                value={frequencyPeriod}
                onChange={(e) => {
                  recalc({ frequencyPeriod: e.target.value as FrequencyPeriod });
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                  height: '2.5rem',
                  padding: '0 0.5rem',
                  backgroundColor: 'var(--nx-void-surface)',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  borderTopRightRadius: 'var(--radius-md)',
                  borderBottomRightRadius: 'var(--radius-md)',
                  color: 'var(--nx-text-secondary)',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none' as const,
                  whiteSpace: 'nowrap',
                  paddingRight: '0.75rem',
                }}
              >
                {frequencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p style={helperTextStyle}>How widely is this used across the team?</p>
      </section>

      {/* Section 3: Projected Impact */}
      {hasAnyValue && (
        <section>
          <h3 style={sectionHeaderStyle}>Projected Impact</h3>
          <div
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1.3fr',
                gap: '0.75rem',
                textAlign: 'center',
              }}
            >
              {/* Column headers */}
              {['Daily', 'Weekly', 'Monthly', 'Annual'].map((label, i) => (
                <div
                  key={label}
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-sans)',
                    color: i === 3 ? 'var(--nx-cyan-base)' : 'var(--nx-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: i === 3 ? 600 : 500,
                    paddingBottom: '0.5rem',
                    borderBottom: i === 3
                      ? '1px solid rgba(0, 212, 255, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {label}
                </div>
              ))}

              {/* Time saved row */}
              <ProjectionCell
                value={formatTime(value.dailyTimeSavedMinutes)}
                color="var(--nx-green-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatTime(value.weeklyTimeSavedMinutes)}
                color="var(--nx-green-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatTime(value.monthlyTimeSavedHours * 60)}
                color="var(--nx-green-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatTime(value.annualTimeSavedHours * 60)}
                color="var(--nx-green-base)"
                isAnnual
              />

              {/* Money saved row */}
              <ProjectionCell
                value={formatMoney(value.dailyMoneySaved)}
                color="var(--nx-amber-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatMoney(value.weeklyMoneySaved)}
                color="var(--nx-amber-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatMoney(value.monthlyMoneySaved)}
                color="var(--nx-amber-base)"
                isAnnual={false}
              />
              <ProjectionCell
                value={formatMoney(value.annualMoneySaved)}
                color="var(--nx-amber-base)"
                isAnnual
              />
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Impact Score */}
      {hasMetrics && score && (
        <section>
          <h3 style={sectionHeaderStyle}>Impact Score</h3>
          <div
            style={{
              background: 'var(--nx-glass-medium)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            {/* Grade badge */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
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
                  fontSize: 'var(--text-xs)',
                  color: gradeColors[score.grade],
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  whiteSpace: 'nowrap',
                  opacity: 0.85,
                }}
              >
                {quadrantLabels[score.quadrant]}
              </div>
            </div>

            {/* Score bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ScoreBar
                label="Value"
                value={Math.round(score.valuePerUse)}
                color="var(--nx-green-base)"
                glowColor="rgba(0, 255, 136, 0.3)"
              />
              <ScoreBar
                label="Scale"
                value={Math.round(score.scaleFactor)}
                color="var(--nx-cyan-base)"
                glowColor="rgba(0, 212, 255, 0.3)"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// --- Sub-components ---

function ProjectionCell({
  value,
  color,
  isAnnual,
}: {
  value: string;
  color: string;
  isAnnual: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: isAnnual ? 'var(--font-display)' : 'var(--font-mono)',
        fontSize: isAnnual ? 'var(--text-lg)' : 'var(--text-sm)',
        fontWeight: isAnnual ? 600 : 500,
        color,
        padding: '0.375rem 0',
        textShadow: isAnnual ? `0 0 12px ${color}88` : undefined,
      }}
    >
      {value}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
  glowColor,
}: {
  label: string;
  value: number;
  color: string;
  glowColor: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--nx-text-tertiary)',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
          }}
        >
          {clamped}
        </span>
      </div>
      <div
        style={{
          height: '6px',
          backgroundColor: 'var(--nx-void-deep)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            boxShadow: `0 0 8px ${glowColor}`,
            transition: 'width 300ms ease',
          }}
        />
      </div>
    </div>
  );
}

export { MetricsCalculator, type MetricsCalculatorProps };
