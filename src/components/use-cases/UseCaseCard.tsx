import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge, type BadgeVariant } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import type { UseCase, ScoreGrade } from '../../types';
import { calculateScore, formatMoney } from '../../utils/metricsCalculator';

interface UseCaseCardProps {
  useCase: UseCase;
}

const impactVariant: Record<string, BadgeVariant> = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

const statusVariant: Record<string, BadgeVariant> = {
  idea: 'info',
  pilot: 'primary',
  active: 'success',
  archived: 'neutral',
};

/* Map status to a CSS accent color for the left-edge gradient */
const statusAccentColor: Record<string, string> = {
  idea: 'var(--nx-violet-base)',
  pilot: 'var(--nx-cyan-base)',
  active: 'var(--nx-green-base)',
  archived: 'var(--nx-text-ghost)',
};

const gradeColors: Record<ScoreGrade, string> = {
  S: 'var(--nx-cyan-bright)',
  A: 'var(--nx-green-bright)',
  B: 'var(--nx-blue-bright)',
  C: 'var(--nx-amber-bright)',
  D: 'var(--nx-red-bright)',
};

function UseCaseCard({ useCase }: UseCaseCardProps) {
  const accent = statusAccentColor[useCase.status] || 'var(--nx-cyan-base)';
  const score = useCase.metrics ? calculateScore(useCase.metrics) : null;
  const hasAnnualMetrics =
    useCase.metrics &&
    (useCase.metrics.annualTimeSavedHours > 0 || useCase.metrics.annualMoneySaved > 0);

  return (
    <Link to={`/use-cases/${useCase.id}`} className="block group">
      <Card hoverable padding="md">
        {/* Left-edge vertical accent gradient */}
        <div
          className="absolute top-0 left-0 w-[2px] h-full"
          style={{
            background: `linear-gradient(180deg, ${accent} 0%, transparent 80%)`,
          }}
        />

        {/* Header: status + score grade + department */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[useCase.status] || 'neutral'} size="sm">
              {useCase.status}
            </Badge>
            {score && score.overallScore > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1,
                  color: gradeColors[score.grade],
                  backgroundColor: `${gradeColors[score.grade]}18`,
                  border: `1px solid ${gradeColors[score.grade]}44`,
                  borderRadius: '9999px',
                  padding: '2px 8px',
                  letterSpacing: '0.05em',
                }}
              >
                {score.grade}
              </span>
            )}
          </div>
          <span
            className="text-xs"
            style={{
              color: 'var(--nx-text-tertiary)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
            }}
          >
            {useCase.department}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold mb-1 line-clamp-1"
          style={{
            color: 'var(--nx-text-primary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {useCase.title}
        </h3>

        {/* Description */}
        <p
          className="text-sm mb-3 line-clamp-2"
          style={{ color: 'var(--nx-text-secondary)' }}
        >
          {useCase.description}
        </p>

        {/* Compact annual metrics line */}
        {hasAnnualMetrics && (
          <p
            className="mb-3"
            style={{
              fontSize: '12px',
              fontFamily: "var(--font-mono)",
              color: 'var(--nx-text-tertiary)',
            }}
          >
            {[
              useCase.metrics.annualTimeSavedHours > 0
                ? `${Math.round(useCase.metrics.annualTimeSavedHours)}h/yr`
                : null,
              useCase.metrics.annualMoneySaved > 0
                ? `${formatMoney(useCase.metrics.annualMoneySaved)}/yr`
                : null,
            ]
              .filter(Boolean)
              .join(' \u00B7 ')}
          </p>
        )}

        {/* Impact / Effort badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={impactVariant[useCase.impact] || 'neutral'} size="sm">
            {useCase.impact} impact
          </Badge>
          <Badge variant="neutral" size="sm">
            {useCase.effort} effort
          </Badge>
        </div>

        {/* Tags */}
        {useCase.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {useCase.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            {useCase.tags.length > 3 && (
              <span
                className="text-xs flex items-center"
                style={{ color: 'var(--nx-text-ghost)' }}
              >
                +{useCase.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer meta */}
        <div
          className="mt-3 pt-3 flex items-center justify-between text-xs"
          style={{
            borderTop: '1px solid var(--nx-cyan-aura)',
            color: 'var(--nx-text-tertiary)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)' }}>{useCase.aiTool}</span>
          <span>{useCase.submittedBy}</span>
        </div>
      </Card>
    </Link>
  );
}

export { UseCaseCard };
