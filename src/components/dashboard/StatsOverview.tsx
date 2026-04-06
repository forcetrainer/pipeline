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
  S: 'var(--nx-cyan-base)',
  A: 'var(--nx-green-base)',
  B: 'var(--nx-blue-base)',
  C: 'var(--nx-amber-base)',
  D: 'var(--nx-red-base)',
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
    accent: 'var(--nx-cyan-base)',
    glowAura: 'var(--nx-cyan-aura)',
    borderColor: 'var(--nx-cyan-aura)',
    borderHover: 'var(--nx-cyan-glow)',
    iconBg: 'var(--nx-cyan-aura)',
  },
  {
    key: 'annualTimeSavedHours' as const,
    label: 'Annual Hours Saved',
    icon: Clock,
    accent: 'var(--nx-green-base)',
    glowAura: 'var(--nx-green-aura)',
    borderColor: 'var(--nx-green-aura)',
    borderHover: 'var(--nx-green-glow)',
    iconBg: 'var(--nx-green-aura)',
  },
  {
    key: 'annualMoneySaved' as const,
    label: 'Annual Savings',
    icon: DollarSign,
    accent: 'var(--nx-amber-base)',
    glowAura: 'var(--nx-amber-aura)',
    borderColor: 'var(--nx-amber-aura)',
    borderHover: 'var(--nx-amber-glow)',
    iconBg: 'var(--nx-amber-aura)',
  },
  {
    key: 'averageScore' as const,
    label: 'Average Score',
    icon: Trophy,
    accent: 'var(--nx-violet-base)',
    glowAura: 'var(--nx-violet-aura)',
    borderColor: 'var(--nx-violet-aura)',
    borderHover: 'var(--nx-violet-glow)',
    iconBg: 'var(--nx-violet-aura)',
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
              background: 'var(--nx-glass-heavy)',
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
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: 'var(--nx-text-primary)',
                    textShadow: `0 0 8px ${stat.glowAura}`,
                  }}
                >
                  {getDisplayValue(stat.key, props)}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--nx-text-tertiary)',
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
