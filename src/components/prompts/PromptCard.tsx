import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Star } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tag } from '../ui/Tag';
import type { Prompt } from '../../types';

interface PromptCardProps {
  prompt: Prompt;
}

/** Map effectiveness rating (0-10) to a colour token */
function effectivenessColor(rating: number): string {
  if (rating >= 8) return 'var(--nx-green-base)';
  if (rating >= 5) return 'var(--nx-amber-base)';
  return 'var(--nx-red-base)';
}

function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Link to={`/prompts/${prompt.id}`} className="block group">
      <Card hoverable padding="none">
        {/* Top-edge gradient in violet/blue (distinct from use-case cyan) */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, var(--nx-violet-base) 0%, var(--nx-blue-base) 60%, transparent 100%)',
          }}
        />

        <div className="p-5">
          {/* Header: category badge + AI tool label + copy button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                {prompt.category}
              </Badge>
              <span
                className="text-xs"
                style={{
                  color: 'var(--nx-text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.05em',
                }}
              >
                {prompt.aiTool}
              </span>
            </div>

            {/* Copy-to-clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-md transition-all duration-200 hover:scale-110"
              style={{
                color: copied ? 'var(--nx-green-base)' : 'var(--nx-text-tertiary)',
                backgroundColor: 'rgba(22, 27, 34, 0.6)',
                border: '1px solid rgba(139, 148, 158, 0.15)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--nx-glow-violet)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(168, 85, 247, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139, 148, 158, 0.15)';
              }}
              aria-label="Copy prompt to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Title */}
          <h3
            className="text-base font-semibold mb-1 line-clamp-1"
            style={{
              color: 'var(--nx-text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {prompt.title}
          </h3>

          {/* Description */}
          <p
            className="text-sm mb-3 line-clamp-2"
            style={{ color: 'var(--nx-text-secondary)' }}
          >
            {prompt.description}
          </p>

          {/* Prompt content preview (code-like, monospace) */}
          <div
            className="mb-3 p-3 rounded-md text-xs line-clamp-3 leading-relaxed"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--nx-violet-bright)',
              backgroundColor: 'var(--nx-void-deep)',
              border: '1px solid rgba(168, 85, 247, 0.15)',
            }}
          >
            {prompt.content}
          </div>

          {/* Stars + effectiveness indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {prompt.starCount > 0 && (
                <span className="flex items-center gap-1 text-xs" style={{ color: '#fbbf24' }}>
                  <Star size={12} fill="#fbbf24" strokeWidth={0} />
                  {prompt.starCount}
                </span>
              )}
            </div>

            {/* Effectiveness indicator */}
            {prompt.effectivenessRating > 0 && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: effectivenessColor(prompt.effectivenessRating),
                    boxShadow: `0 0 6px ${effectivenessColor(prompt.effectivenessRating)}`,
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: effectivenessColor(prompt.effectivenessRating),
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {prompt.effectivenessRating}/10
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {prompt.tags.length > 3 && (
                <span
                  className="text-xs flex items-center"
                  style={{ color: 'var(--nx-text-ghost)' }}
                >
                  +{prompt.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer meta */}
          <div
            className="mt-3 pt-3 text-xs"
            style={{
              borderTop: '1px solid rgba(168, 85, 247, 0.1)',
              color: 'var(--nx-text-tertiary)',
            }}
          >
            <span>by {prompt.submittedBy}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export { PromptCard };
