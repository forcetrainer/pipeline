import { useState, useCallback, useRef } from 'react';
import type { CostTracking } from '../../types';
import { calculateCostTotals, formatMoney } from '../../utils/metricsCalculator';

interface CostTrackerProps {
  value: CostTracking | undefined;
  onChange: (costs: CostTracking | undefined) => void;
}

// --- Shared styles (matching MetricsCalculator) ---

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

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.boxShadow = 'var(--nx-glow-cyan)';
  e.currentTarget.style.borderColor = 'var(--nx-cyan-base)';
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.boxShadow = '';
  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.15)';
}

// --- Component ---

function CostTracker({ value, onChange }: CostTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(!!value);

  const buildCostInternal = value?.buildCostInternal || 0;
  const buildCostExternal = value?.buildCostExternal || 0;
  const licensingOneTime = value?.licensingOneTime || 0;
  const licensingRecurring = value?.licensingRecurring || 0;
  const computeRecurring = value?.computeRecurring || 0;
  const maintenanceRecurring = value?.maintenanceRecurring || 0;
  const notes = value?.notes || '';

  const hasAnyCost =
    buildCostInternal > 0 ||
    buildCostExternal > 0 ||
    licensingOneTime > 0 ||
    licensingRecurring > 0 ||
    computeRecurring > 0 ||
    maintenanceRecurring > 0;

  const recalc = useCallback(
    (overrides: Partial<{
      buildCostInternal: number;
      buildCostExternal: number;
      licensingOneTime: number;
      licensingRecurring: number;
      computeRecurring: number;
      maintenanceRecurring: number;
      notes: string;
    }>) => {
      const input = {
        buildCostInternal: overrides.buildCostInternal ?? buildCostInternal,
        buildCostExternal: overrides.buildCostExternal ?? buildCostExternal,
        licensingOneTime: overrides.licensingOneTime ?? licensingOneTime,
        licensingRecurring: overrides.licensingRecurring ?? licensingRecurring,
        computeRecurring: overrides.computeRecurring ?? computeRecurring,
        maintenanceRecurring: overrides.maintenanceRecurring ?? maintenanceRecurring,
        notes: overrides.notes ?? notes,
      };
      onChange(calculateCostTotals(input));
    },
    [buildCostInternal, buildCostExternal, licensingOneTime, licensingRecurring, computeRecurring, maintenanceRecurring, notes, onChange],
  );

  const oneTimeTotal = buildCostInternal + buildCostExternal + licensingOneTime;
  const monthlyTotal = licensingRecurring + computeRecurring + maintenanceRecurring;
  const annualTotal = monthlyTotal * 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0.75rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--nx-text-secondary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-sm)',
          fontWeight: 500,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--nx-text-tertiary)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Cost Tracking (Optional)
        </span>
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 200ms ease',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--nx-text-tertiary)',
            fontSize: 'var(--text-sm)',
          }}
        >
          ▼
        </span>
      </button>

      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
          {/* One-Time Costs */}
          <section>
            <h3 style={sectionHeaderStyle}>One-Time Costs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <DollarInput
                label="Build cost (internal)"
                placeholder="Internal labor cost"
                value={buildCostInternal}
                onChange={(v) => recalc({ buildCostInternal: v })}
              />
              <DollarInput
                label="Build cost (external)"
                placeholder="Vendor/contractor cost"
                value={buildCostExternal}
                onChange={(v) => recalc({ buildCostExternal: v })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <DollarInput
                label="Licensing (one-time)"
                placeholder="One-time license fees"
                value={licensingOneTime}
                onChange={(v) => recalc({ licensingOneTime: v })}
              />
              <div />
            </div>
            {oneTimeTotal > 0 && (
              <p style={helperTextStyle}>
                One-time total: {formatMoney(oneTimeTotal)}
              </p>
            )}
          </section>

          {/* Recurring Costs */}
          <section>
            <h3 style={sectionHeaderStyle}>Recurring Costs (Monthly)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <DollarInput
                label="Licensing"
                placeholder="Monthly subscription costs"
                value={licensingRecurring}
                onChange={(v) => recalc({ licensingRecurring: v })}
              />
              <DollarInput
                label="Compute/API"
                placeholder="API calls, hosting, compute"
                value={computeRecurring}
                onChange={(v) => recalc({ computeRecurring: v })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
              <DollarInput
                label="Maintenance"
                placeholder="Ongoing maintenance labor"
                value={maintenanceRecurring}
                onChange={(v) => recalc({ maintenanceRecurring: v })}
              />
              <div />
            </div>
            {monthlyTotal > 0 && (
              <p style={helperTextStyle}>
                Monthly total: {formatMoney(monthlyTotal)} · Annual projection: {formatMoney(annualTotal)}
              </p>
            )}
          </section>

          {/* Notes */}
          <section>
            <h3 style={sectionHeaderStyle}>Notes</h3>
            <textarea
              placeholder="Context about these costs, assumptions, etc."
              value={notes}
              onChange={(e) => recalc({ notes: e.target.value })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              rows={3}
              style={{
                ...inputBaseStyle,
                height: 'auto',
                padding: '0.75rem',
                resize: 'vertical',
                minHeight: '5rem',
              }}
            />
          </section>

          {/* Totals Summary Panel */}
          {hasAnyCost && (
            <section>
              <h3 style={sectionHeaderStyle}>Cost Summary</h3>
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
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  {/* Column headers */}
                  {['One-Time', 'Monthly', 'Annual'].map((label, i) => (
                    <div
                      key={label}
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-sans)',
                        color: i === 2 ? 'var(--nx-cyan-base)' : 'var(--nx-text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: i === 2 ? 600 : 500,
                        paddingBottom: '0.5rem',
                        borderBottom: i === 2
                          ? '1px solid rgba(0, 212, 255, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      {label}
                    </div>
                  ))}

                  {/* Values */}
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--nx-amber-base)',
                      padding: '0.375rem 0',
                    }}
                  >
                    {formatMoney(oneTimeTotal)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--nx-amber-base)',
                      padding: '0.375rem 0',
                    }}
                  >
                    {formatMoney(monthlyTotal)}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 600,
                      color: 'var(--nx-amber-base)',
                      padding: '0.375rem 0',
                      textShadow: '0 0 12px rgba(255, 170, 0, 0.53)',
                    }}
                  >
                    {formatMoney(annualTotal)}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-component ---

function formatWithCommas(num: number): string {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function DollarInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // When focused, show raw input for easy editing; when blurred, show formatted
  const displayValue = value > 0
    ? (isFocused ? rawInput : formatWithCommas(value))
    : (isFocused ? rawInput : '');

  return (
    <div>
      <label style={labelStyle}>{label}</label>
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
          ref={inputRef}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            const stripped = e.target.value.replace(/,/g, '');
            const cleaned = stripped.replace(/[^0-9.]/g, '');
            const parts = cleaned.split('.');
            const sanitized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
            setRawInput(sanitized);
            onChange(parseFloat(sanitized) || 0);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            setRawInput(value > 0 ? value.toString() : '');
            handleFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setRawInput('');
            handleBlur(e);
          }}
          style={{
            ...inputBaseStyle,
            paddingLeft: '1.5rem',
          }}
        />
      </div>
    </div>
  );
}

export { CostTracker, type CostTrackerProps };
