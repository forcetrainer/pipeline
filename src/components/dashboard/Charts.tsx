/**
 * Dashboard chart components.
 *
 * Uses Recharts for visualization with dark sci-fi theme.
 * Chart colors: cyan, green, violet, amber, blue, red
 *
 * Chart styling:
 * - Grid lines: very subtle (rgba(110, 118, 129, 0.15))
 * - Axis labels: secondary text (#8b949e), Exo 2 font, 12px
 * - Tooltips: dark bg (#0d1117), cyan-tinted border, light text
 * - Bar corners: rounded (radius 4px)
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  Legend,
} from 'recharts';
import type { ScoreGrade } from '../../types';

const COLORS = ['#00d4ff', '#00ff88', '#a855f7', '#ffaa00', '#3b82f6', '#ff3366'];

const AXIS_TICK = {
  fontSize: 12,
  fill: '#8b949e',
  fontFamily: "'Exo 2', sans-serif",
};

const TOOLTIP_STYLE = {
  backgroundColor: '#0d1117',
  border: '1px solid rgba(0, 212, 255, 0.3)',
  borderRadius: '8px',
  color: '#e6edf3',
  fontSize: '13px',
  fontFamily: "'Exo 2', sans-serif",
};

const GRADE_COLORS: Record<ScoreGrade, string> = {
  S: '#00d4ff',
  A: '#00ff88',
  B: '#3b82f6',
  C: '#ffaa00',
  D: '#ff3366',
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
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
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
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6edf3',
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
            stroke="rgba(110, 118, 129, 0.15)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            axisLine={{ stroke: 'rgba(110, 118, 129, 0.15)' }}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }}
          />
          <Bar
            dataKey="count"
            fill="#00d4ff"
            radius={[4, 4, 0, 0]}
            style={{ filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.4))' }}
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
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
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
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6edf3',
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
                style={{ filter: `drop-shadow(0 0 4px ${COLORS[index % COLORS.length]}66)` }}
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
        backgroundColor: 'rgba(13, 17, 23, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '8px',
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        maxWidth: '220px',
      }}
    >
      <p style={{
        color: '#e6edf3',
        fontFamily: "'Exo 2', sans-serif",
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '6px',
      }}>
        {d.name}
      </p>
      <p style={{ color: '#8b949e', fontSize: '12px', fontFamily: "'Exo 2', sans-serif" }}>
        Value: <span style={{ color: GRADE_COLORS[d.grade] }}>{d.valueScore.toFixed(0)}</span>
      </p>
      <p style={{ color: '#8b949e', fontSize: '12px', fontFamily: "'Exo 2', sans-serif" }}>
        Scale: <span style={{ color: GRADE_COLORS[d.grade] }}>{d.scaleScore.toFixed(0)}</span>
      </p>
      <p style={{ color: '#8b949e', fontSize: '12px', fontFamily: "'Exo 2', sans-serif" }}>
        Annual: <span style={{ color: '#ffaa00' }}>${d.annualSavings.toLocaleString()}</span>
      </p>
      <p style={{ color: '#8b949e', fontSize: '12px', fontFamily: "'Exo 2', sans-serif" }}>
        Grade: <span style={{ color: GRADE_COLORS[d.grade], fontWeight: 700 }}>{d.grade}</span>
      </p>
    </div>
  );
}

const QUADRANT_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Exo 2', sans-serif",
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
          stroke="rgba(110, 118, 129, 0.1)"
        />
        <XAxis
          type="number"
          dataKey="scaleScore"
          name="Scale"
          domain={[0, 100]}
          tick={AXIS_TICK}
          axisLine={{ stroke: 'rgba(110, 118, 129, 0.15)' }}
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
          axisLine={{ stroke: 'rgba(110, 118, 129, 0.15)' }}
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
          stroke="rgba(110, 118, 129, 0.3)"
          strokeDasharray="6 4"
        />
        <ReferenceLine
          y={50}
          stroke="rgba(110, 118, 129, 0.3)"
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
              style={{ filter: `drop-shadow(0 0 4px ${GRADE_COLORS[grade]}66)` }}
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
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
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
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6edf3',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Value vs Scale Matrix
      </h3>
      <div className="flex gap-4 mb-2" style={{ flexWrap: 'wrap' }}>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'rgba(0, 255, 136, 0.6)' }}>&#9650;</span>{' '}
          <span style={{ color: '#6e7681' }}>Top-right: Force Multiplier</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'rgba(168, 85, 247, 0.6)' }}>&#9650;</span>{' '}
          <span style={{ color: '#6e7681' }}>Top-left: Power Tool</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'rgba(59, 130, 246, 0.6)' }}>&#9660;</span>{' '}
          <span style={{ color: '#6e7681' }}>Bottom-right: Hidden Gem</span>
        </span>
        <span style={QUADRANT_LABEL_STYLE}>
          <span style={{ color: 'rgba(110, 118, 129, 0.6)' }}>&#9660;</span>{' '}
          <span style={{ color: '#6e7681' }}>Bottom-left: Emerging</span>
        </span>
      </div>
      {data.length > 0 ? (
        <ValueScaleScatter data={data} />
      ) : (
        <p style={{ color: '#6e7681' }} className="text-sm text-center py-10">No data yet</p>
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
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
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
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6edf3',
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
              stroke="rgba(110, 118, 129, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="grade"
              tick={AXIS_TICK}
              axisLine={{ stroke: 'rgba(110, 118, 129, 0.15)' }}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`grade-${index}`}
                  fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}66)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: '#6e7681' }} className="text-sm text-center py-10">No data yet</p>
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
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid rgba(0, 212, 255, 0.15)',
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
          fontFamily: "'Exo 2', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#e6edf3',
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
              stroke="rgba(110, 118, 129, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tick={AXIS_TICK}
              axisLine={{ stroke: 'rgba(110, 118, 129, 0.15)' }}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }}
              formatter={(value: number, name: string) => {
                if (name === 'hours') return [`${value.toFixed(1)}h`, 'Time Saved'];
                return [`$${value.toLocaleString()}`, 'Money Saved'];
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                fontFamily: "'Exo 2', sans-serif",
                color: '#8b949e',
              }}
            />
            <Bar
              dataKey="hours"
              name="Time (hours)"
              fill="#00ff88"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.4))' }}
            />
            <Bar
              dataKey="money"
              name="Money ($)"
              fill="#ffaa00"
              radius={[4, 4, 0, 0]}
              style={{ filter: 'drop-shadow(0 0 4px rgba(255, 170, 0, 0.4))' }}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p style={{ color: '#6e7681' }} className="text-sm text-center py-10">No data yet</p>
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
