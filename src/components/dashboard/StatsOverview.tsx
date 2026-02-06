import { Lightbulb, BookOpen, TrendingUp, Users } from 'lucide-react';

interface StatsOverviewProps {
  totalUseCases: number;
  totalPrompts: number;
  activeUseCases: number;
  departments: number;
}

const stats_config = [
  {
    key: 'totalUseCases',
    label: 'Total Use Cases',
    icon: Lightbulb,
    accent: '#00d4ff',
    glowAura: 'rgba(0, 212, 255, 0.15)',
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderHover: 'rgba(0, 212, 255, 0.6)',
    iconBg: 'rgba(0, 212, 255, 0.1)',
  },
  {
    key: 'activeUseCases',
    label: 'Active Use Cases',
    icon: TrendingUp,
    accent: '#00ff88',
    glowAura: 'rgba(0, 255, 136, 0.15)',
    borderColor: 'rgba(0, 255, 136, 0.3)',
    borderHover: 'rgba(0, 255, 136, 0.6)',
    iconBg: 'rgba(0, 255, 136, 0.1)',
  },
  {
    key: 'departments',
    label: 'Departments',
    icon: Users,
    accent: '#ffaa00',
    glowAura: 'rgba(255, 170, 0, 0.15)',
    borderColor: 'rgba(255, 170, 0, 0.3)',
    borderHover: 'rgba(255, 170, 0, 0.6)',
    iconBg: 'rgba(255, 170, 0, 0.1)',
  },
  {
    key: 'totalPrompts',
    label: 'Shared Prompts',
    icon: BookOpen,
    accent: '#a855f7',
    glowAura: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderHover: 'rgba(168, 85, 247, 0.6)',
    iconBg: 'rgba(168, 85, 247, 0.1)',
  },
] as const;

const valueMap: Record<string, keyof StatsOverviewProps> = {
  totalUseCases: 'totalUseCases',
  activeUseCases: 'activeUseCases',
  departments: 'departments',
  totalPrompts: 'totalPrompts',
};

function StatsOverview({ totalUseCases, totalPrompts, activeUseCases, departments }: StatsOverviewProps) {
  const values: StatsOverviewProps = { totalUseCases, totalPrompts, activeUseCases, departments };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats_config.map((stat) => (
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
          {/* Top-edge gradient accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, ${stat.accent} 0%, transparent 70%)`,
            }}
          />
          {/* Left-edge vertical gradient accent */}
          <div
            className="absolute top-0 left-0 bottom-0 w-[2px]"
            style={{
              background: `linear-gradient(180deg, ${stat.accent} 0%, transparent 70%)`,
            }}
          />

          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: stat.iconBg }}
            >
              <stat.icon size={20} style={{ color: stat.accent }} />
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
                {values[valueMap[stat.key]]}
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
      ))}
    </div>
  );
}

export { StatsOverview, type StatsOverviewProps };
