import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, { className: string; style: React.CSSProperties }> = {
  primary: {
    className:
      'bg-primary-200 text-primary-400 border border-primary-500/30 hover:border-primary-500/60 active:bg-primary-300',
    style: {},
  },
  secondary: {
    className:
      'bg-transparent text-neutral-50 border border-neutral-500 hover:border-primary-500/40 hover:text-primary-400 active:bg-neutral-700',
    style: {},
  },
  ghost: {
    className:
      'bg-transparent text-neutral-200 border border-transparent hover:bg-neutral-700 hover:text-neutral-50 active:bg-neutral-600',
    style: {},
  },
  danger: {
    className:
      'bg-error-100 text-error-400 border border-error-500/30 hover:border-error-500/60 active:bg-error-200',
    style: {},
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, style, ...props }, ref) => {
    const variantConf = variantStyles[variant];

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-md
          transition-all duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-800
          disabled:opacity-50 disabled:pointer-events-none
          hover:-translate-y-0.5
          ${variantConf.className}
          ${sizeClasses[size]}
          ${className}
        `}
        style={{
          ...variantConf.style,
          ...style,
        }}
        onMouseEnter={(e) => {
          const glow = variant === 'danger'
            ? 'var(--nx-glow-red)'
            : 'var(--nx-glow-cyan)';
          (e.currentTarget as HTMLElement).style.boxShadow = glow;
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '';
          props.onMouseLeave?.(e);
        }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
