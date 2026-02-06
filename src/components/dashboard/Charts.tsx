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
} from 'recharts';

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

export { UseCaseByCategoryChart, DepartmentDistributionChart };
