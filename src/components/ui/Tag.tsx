import { type HTMLAttributes } from 'react';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

function Tag({ className = '', children, onRemove, ...props }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5 text-xs font-medium
        text-primary-400 rounded-full
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-border-subtle)',
        border: '1px solid var(--color-border-strong)',
      }}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 text-neutral-400 hover:text-primary-400 transition-colors"
          aria-label={`Remove ${children}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { Tag, type TagProps };
