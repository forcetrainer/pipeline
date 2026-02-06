import { UseCaseCard } from './UseCaseCard';
import type { UseCase } from '../../types';

interface UseCaseListProps {
  useCases: UseCase[];
  isLoading?: boolean;
}

function UseCaseList({ useCases, isLoading }: UseCaseListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 rounded-lg animate-pulse"
            style={{
              backgroundColor: 'var(--nx-void-elevated)',
              border: '1px solid rgba(0, 212, 255, 0.08)',
            }}
          />
        ))}
      </div>
    );
  }

  if (useCases.length === 0) {
    return (
      <div className="text-center py-16">
        <p
          className="text-lg mb-2"
          style={{ color: 'var(--nx-text-secondary)' }}
        >
          No use cases found
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--nx-text-tertiary)' }}
        >
          Try adjusting your filters or add a new use case.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {useCases.map((uc) => (
        <UseCaseCard key={uc.id} useCase={uc} />
      ))}
    </div>
  );
}

export { UseCaseList };
