/**
 * Dashboard chart components.
 *
 * Uses Recharts for visualization with dark sci-fi theme.
 * Chart colors: cyan, green, violet, amber, blue, red
 *
 * Chart styling:
 * - Grid lines: var(--color-border-subtle)
 * - Axis labels: var(--nx-text-tertiary), var(--font-sans), 12px
 * - Tooltips: var(--nx-void-panel) bg, var(--color-border-strong) border
 * - Bar corners: rounded (radius 4px)
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  Legend,
} from 'recharts';
import type { ScoreGrade } from '../../types';

const COLORS = ['var(--nx-cyan-base)', 'var(--nx-green-base)', 'var(--nx-violet-base)', 'var(--nx-amber-base)', 'var(--nx-blue-base)', 'var(--nx-red-base)'];

const AXIS_TICK = {
  fontSize: 12,
  fill: 'var(--nx-text-tertiary)',
  fontFamily: 'var(--font-sans)',
};

const TOOLTIP_STYLE = {
  backgroundColor: 'var(--nx-void-panel)',
  border: '1px solid var(--color-border-strong)',
  borderRadius: '8px',
  color: 'var(--nx-text-primary)',
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
};

const GRADE_COLORS: Record<ScoreGrade, string> = {
  S: 'var(--nx-cyan-base)',
  A: 'var(--nx-green-base)',
  B: 'var(--nx-blue-base)',
  C: 'var(--nx-amber-base)',
  D: 'var(--nx-red-base)',
};

const GRADE_GLOWS: Record<ScoreGrade, string> = {
  S: 'var(--nx-cyan-glow)',
  A: 'var(--nx-green-glow)',
  B: 'var(--nx-blue-glow)',
  C: 'var(--nx-amber-glow)',
  D: 'var(--nx-red-glow)',
};

interface CategoryData {
  name: string;
  count: number;
}

interface UseCasesByCategory {
  data: CategoryData[];
}

function UseCaseByCategoryChart({ data }: UseCasesByCategory) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--nx-cyan-base) 0%, transparent 70%)',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--nx-text-primary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Use Cases by Category
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            axisLine={{ stroke: 'var(--color-border-subtle)' }}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'var(--nx-cyan-aura)' }}
          />
          <Bar
            dataKey="count"
            fill="var(--nx-cyan-base)"
            radius={[4, 4, 0, 0]}
            style={{ filter: 'drop-shadow(0 0 4px var(--nx-cyan-glow))' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface DepartmentData {
  name: string;
  value: number;
}

interface DepartmentDistribution {
  data: DepartmentData[];
}

function DepartmentDistributionChart({ data }: DepartmentDistribution) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--nx-violet-base) 0%, transparent 70%)',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--nx-text-primary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Department Distribution
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ filter: 'drop-shadow(0 0 4px var(--nx-cyan-glow))' }}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================
   NEW: Value vs Scale Scatter Chart
   ============================================ */

interface ScatterDataPoint {
  name: string;
  valueScore: number;
  scaleScore: number;
  annualSavings: number;
  grade: ScoreGrade;
}

interface ValueScaleScatterProps {
  data: ScatterDataPoint[];
}

function ScatterTooltipContent({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: ScatterDataPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-strong)',
        borderRadius: '8px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        maxWidth: '220px',
      }}
    >
      <p style={{
        color: 'var(--nx-text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '6px',
      }}>
        {d.name}
      </p>
      <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
        Value: <span style={{ color: GRADE_COLORS[d.grade] }}>{d.valueScore.toFixed(0)}</span>
      </p>
      <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
        Scale: <span style={{ color: GRADE_COLORS[d.grade] }}>{d.scaleScore.toFixed(0)}</span>
      </p>
      <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
        Annual: <span style={{ color: 'var(--nx-amber-base)' }}>${d.annualSavings.toLocaleString()}</span>
      </p>
      <p style={{ color: 'var(--nx-text-tertiary)', fontSize: '12px', fontFamily: 'var(--font-sans)' }}>
        Grade: <span style={{ color: GRADE_COLORS[d.grade], fontWeight: 700 }}>{d.grade}</span>
      </p>
    </div>
  );
}

const QUADRANT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  pointerEvents: 'none',
};

function ValueScaleScatter({ data }: ValueScaleScatterProps) {
  // Group data by grade for separate colored scatters
  const gradeGroups: Record<ScoreGrade, ScatterDataPoint[]> = {
    S: [], A: [], B: [], C: [], D: [],
  };
  data.forEach((d) => {
    gradeGroups[d.grade].push(d);
  });

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ScatterChart margin={{ top: 24, right: 24, bottom: 12, left: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border-subtle)"
        />
        <XAxis
          type="number"
          dataKey="scaleScore"
          name="Scale"
          domain={[0, 100]}
          tick={AXIS_TICK}
          axisLine={{ stroke: 'var(--color-border-subtle)' }}
          tickLine={false}
          label={{
            value: 'Scale Score',
            position: 'insideBottom',
            offset: -4,
            style: { ...AXIS_TICK, fontSize: 11 },
          }}
        />
        <YAxis
          type="number"
          dataKey="valueScore"
          name="Value"
          domain={[0, 100]}
          tick={AXIS_TICK}
          axisLine={{ stroke: 'var(--color-border-subtle)' }}
          tickLine={false}
          label={{
            value: 'Value Score',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: { ...AXIS_TICK, fontSize: 11 },
          }}
        />
        <ZAxis
          type="number"
          dataKey="annualSavings"
          range={[60, 400]}
          name="Annual Savings"
        />
        {/* Quadrant reference lines */}
        <ReferenceLine
          x={50}
          stroke="var(--color-border-default)"
          strokeDasharray="6 4"
        />
        <ReferenceLine
          y={50}
          stroke="var(--color-border-default)"
          strokeDasharray="6 4"
        />
        <Tooltip
          content={<ScatterTooltipContent />}
          cursor={false}
        />
        {/* Render each grade group as a separate Scatter for colors */}
        {(Object.keys(gradeGroups) as ScoreGrade[]).map((grade) =>
          gradeGroups[grade].length > 0 ? (
            <Scatter
              key={grade}
              name={`Grade ${grade}`}
              data={gradeGroups[grade]}
              fill={GRADE_COLORS[grade]}
              fillOpacity={0.8}
              stroke={GRADE_COLORS[grade]}
              strokeOpacity={0.3}
              strokeWidth={2}
              style={{ filter: `drop-shadow(0 0 4px ${GRADE_GLOWS[grade]})` }}
            />
          ) : null
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ValueScaleScatterChart({ data }: ValueScaleScatterProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--nx-cyan-base) 0%, transparent 70%)',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--nx-text-primary)',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Value vs Scale Matrix
      </h3>
      <div className="flex gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'var(--nx-green-glow)' }}>&#9650;</span>{' '}
          <span style={{ color: 'var(--nx-text-ghost)' }}>Top-right: Force Multiplier</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'var(--nx-violet-glow)' }}>&#9650;</span>{' '}
          <span style={{ color: 'var(--nx-text-ghost)' }}>Top-left: Power Tool</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'var(--nx-blue-glow)' }}>&#9660;</span>{' '}
          <span style={{ color: 'var(--nx-text-ghost)' }}>Bottom-right: Hidden Gem</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'var(--nx-text-ghost)' }}>&#9660;</span>{' '}
          <span style={{ color: 'var(--nx-text-ghost)' }}>Bottom-left: Emerging</span>
        </span>
      </div>
      {data.length > 0 ? (
        <ValueScaleScatter data={data} />
      ) : (
        <p style={{ color: 'var(--nx-text-ghost)' }} className="text-sm text-center py-10">No data yet</p>
      )}
    </div>
  );
}

/* ============================================
   NEW: Score Distribution Chart
   ============================================ */

interface ScoreDistributionData {
  grade: ScoreGrade;
  count: number;
  color: string;
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionData[];
}

function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--nx-green-base) 0%, transparent 70%)',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--nx-text-primary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Score Distribution
      </h3>
      {data.some((d) => d.count > 0) ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="grade"
              tick={AXIS_TICK}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'var(--nx-cyan-aura)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`grade-${index}`}
                  fill={entry.color}
                  style={{ filter: 'drop-shadow(0 0 6px var(--nx-cyan-glow))' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: 'var(--nx-text-ghost)' }} className="text-sm text-center py-10">No data yet</p>
      )}
    </div>
  );
}

/* ============================================
   NEW: Savings by Time Horizon Chart
   ============================================ */

interface SavingsHorizonData {
  period: string;
  hours: number;
  money: number;
}

interface SavingsHorizonChartProps {
  data: SavingsHorizonData[];
}

function SavingsHorizonChart({ data }: SavingsHorizonChartProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg"
      style={{
        background: 'var(--nx-glass-heavy)',
        border: '1px solid var(--color-border-default)',
        backdropFilter: 'blur(8px)',
        padding: '1.25rem',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, var(--nx-amber-base) 0%, transparent 70%)',
        }}
      />
      <h3
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--nx-text-primary)',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Savings by Time Horizon
      </h3>
      {data.some((d) => d.hours > 0 || d.money > 0) ? (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tick={AXIS_TICK}
              axisLine={{ stroke: 'var(--color-border-subtle)' }}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'var(--nx-cyan-aura)' }}
              formatter={((value: number | undefined, name: string | undefined) => {
                const v = value ?? 0;
                if (name === 'hours') return [`${v.toFixed(1)}h`, 'Time Saved'];
                return [`$${v.toLocaleString()}`, 'Money Saved'];
              }) as never}
            />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                color: 'var(--nx-text-tertiary)',
              }}
            />
            <Bar
              dataKey="hours"
              name="Time (hours)"
              fill="var(--nx-green-base)"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 0 4px var(--nx-green-glow))' }}
            />
            <Bar
              dataKey="money"
              name="Money ($)"
              fill="var(--nx-amber-base)"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 0 4px var(--nx-amber-glow))' }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: 'var(--nx-text-ghost)' }} className="text-sm text-center py-10">No data yet</p>
      )}
    </div>
  );
}

export {
  UseCaseByCategoryChart,
  DepartmentDistributionChart,
  ValueScaleScatterChart,
  ScoreDistributionChart,
  SavingsHorizonChart,
  GRADE_COLORS,
};
export type { ScatterDataPoint, ScoreDistributionData, SavingsHorizonData };
