import { PromptCard } from './PromptCard';
import type { Prompt } from '../../types';

interface PromptListProps {
  prompts: Prompt[];
  isLoading?: boolean;
}

function PromptList({ prompts, isLoading }: PromptListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 rounded-lg animate-pulse"
            style={{
              backgroundColor: 'var(--nx-void-elevated)',
              border: '1px solid rgba(168, 85, 247, 0.1)',
            }}
          />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16">
        <p
          className="text-lg mb-2 font-semibold"
          style={{ color: 'var(--nx-text-secondary)' }}
        >
          No prompts found
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--nx-text-tertiary)' }}
        >
          Try adjusting your filters or share a new prompt.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}

export { PromptList };
