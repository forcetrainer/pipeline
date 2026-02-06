import { Lightbulb, Clock, DollarSign, Trophy } from 'lucide-react';
import { formatMoney } from '../../utils/metricsCalculator';
import { getGrade } from '../../utils/metricsCalculator';

interface StatsOverviewProps {
  totalUseCases: number;
  totalPrompts: number;
  annualTimeSavedHours: number;
  annualMoneySaved: number;
  averageScore: number;
}

const GRADE_COLORS: Record<string, string> = {
  S: '#00d4ff',
  A: '#00ff88',
  B: '#3b82f6',
  C: '#ffaa00',
  D: '#ff3366',
};

function formatHours(hours: number): string {
  if (hours >= 10000) return `${(hours / 1000).toFixed(1)}K`;
  if (hours >= 1000) return `${Math.round(hours).toLocaleString()}`;
  return `${Math.round(hours)}`;
}

const stats_config = [
  {
    key: 'totalUseCases' as const,
    label: 'Use Cases',
    icon: Lightbulb,
    accent: '#00d4ff',
    glowAura: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderHover: 'rgba(0, 212, 255, 0.6)',
    iconBg: 'rgba(0, 212, 255, 0.1)',
  },
  {
    key: 'annualTimeSavedHours' as const,
    label: 'Annual Hours Saved',
    icon: Clock,
    accent: '#00ff88',
    glowAura: 'rgba(0, 255, 136, 0.15)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
    borderHover: 'rgba(0, 255, 136, 0.6)',
    iconBg: 'rgba(0, 255, 136, 0.1)',
  },
  {
    key: 'annualMoneySaved' as const,
    label: 'Annual Savings',
    icon: DollarSign,
    accent: '#ffaa00',
    glowAura: 'rgba(255, 170, 0, 0.15)',
    borderColor: 'rgba(255, 170, 0, 0.3)',
    borderHover: 'rgba(255, 170, 0, 0.6)',
    iconBg: 'rgba(255, 170, 0, 0.1)',
  },
  {
    key: 'averageScore' as const,
    label: 'Average Score',
    icon: Trophy,
    accent: '#a855f7',
    glowAura: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderHover: 'rgba(168, 85, 247, 0.6)',
    iconBg: 'rgba(168, 85, 247, 0.1)',
  },
];

function getDisplayValue(
  key: (typeof stats_config)[number]['key'],
  props: StatsOverviewProps
): string {
  switch (key) {
    case 'totalUseCases':
      return String(props.totalUseCases);
    case 'annualTimeSavedHours':
      return `${formatHours(props.annualTimeSavedHours)}h`;
    case 'annualMoneySaved':
      return formatMoney(props.annualMoneySaved);
    case 'averageScore': {
      const grade = getGrade(props.averageScore);
      return grade;
    }
  }
}

function StatsOverview(props: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats_config.map((stat) => {
        const displayAccent =
          stat.key === 'averageScore'
            ? GRADE_COLORS[getGrade(props.averageScore)] || stat.accent
            : stat.accent;

        return (
          <div
            key={stat.key}
            className="group relative overflow-hidden rounded-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 cursor-default"
            style={{
              background: 'rgba(13, 17, 23, 0.85)',
              border: `1px solid ${stat.borderColor}`,
              backdropFilter: 'blur(8px)',
              padding: '1.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = stat.borderHover;
              e.currentTarget.style.boxShadow = `0 0 20px ${stat.glowAura}, 0 4px 16px rgba(0, 0, 0, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = stat.borderColor;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, ${displayAccent} 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute top-0 left-0 bottom-0 w-[2px]"
              style={{
                background: `linear-gradient(180deg, ${displayAccent} 0%, transparent 70%)`,
              }}
            />

            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: stat.iconBg }}
              >
                <stat.icon size={20} style={{ color: displayAccent }} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: '#e6edf3',
                    textShadow: `0 0 8px ${stat.glowAura}`,
                  }}
                >
                  {getDisplayValue(stat.key, props)}
                </p>
                <p
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#8b949e',
                    marginTop: '2px',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { StatsOverview, type StatsOverviewProps };
