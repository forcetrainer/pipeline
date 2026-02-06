import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Calendar, User, Building2 } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui';
import * as useCaseService from '../services/useCaseService';
import { format } from 'date-fns';

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
  const useCase = id ? useCaseService.getUseCaseById(id) : undefined;

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

        {/* Metrics */}
        {useCase.metrics && (useCase.metrics.timeSavedHours > 0 || useCase.metrics.moneySavedDollars > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {useCase.metrics.timeSavedHours > 0 && (
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: 'var(--nx-green-aura)', border: '1px solid rgba(0, 255, 136, 0.2)' }}
                  >
                    <Clock size={16} style={{ color: 'var(--nx-green-base)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--nx-text-tertiary)' }}>Time Saved</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--nx-text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {useCase.metrics.timeSavedHours}h
                    </p>
                  </div>
                </div>
              </Card>
            )}
            {useCase.metrics.moneySavedDollars > 0 && (
              <Card padding="md">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: 'var(--nx-amber-aura)', border: '1px solid rgba(255, 170, 0, 0.2)' }}
                  >
                    <DollarSign size={16} style={{ color: 'var(--nx-amber-base)' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--nx-text-tertiary)' }}>Money Saved</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--nx-text-primary)', fontFamily: "'JetBrains Mono', monospace" }}>
                      ${useCase.metrics.moneySavedDollars.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
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

export default UseCaseDetailPage;
