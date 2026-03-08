import { useState } from 'react';
import { Star } from 'lucide-react';
import * as promptService from '../../services/promptService';

interface StarButtonProps {
  promptId: string;
  initialStarred: boolean;
  initialCount: number;
  onToggle?: (starred: boolean, count: number) => void;
  size?: number;
}

function StarButton({ promptId, initialStarred, initialCount, onToggle, size = 16 }: StarButtonProps) {
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const result = await promptService.toggleStar(promptId);
      setStarred(result.starred);
      setCount(result.starCount);
      onToggle?.(result.starred, result.starCount);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1 transition-all duration-200"
      style={{
        color: starred ? '#fbbf24' : 'var(--nx-text-tertiary)',
        cursor: loading ? 'wait' : 'pointer',
        background: 'none',
        border: 'none',
        padding: '2px 4px',
        borderRadius: '4px',
        fontSize: '12px',
      }}
      onMouseEnter={(e) => {
        if (!starred) e.currentTarget.style.color = '#fbbf24';
      }}
      onMouseLeave={(e) => {
        if (!starred) e.currentTarget.style.color = 'var(--nx-text-tertiary)';
      }}
      aria-label={starred ? 'Unstar prompt' : 'Star prompt'}
    >
      <Star
        size={size}
        fill={starred ? '#fbbf24' : 'none'}
        strokeWidth={starred ? 0 : 1.5}
      />
      {count > 0 && (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          {count}
        </span>
      )}
    </button>
  );
}

export { StarButton };
