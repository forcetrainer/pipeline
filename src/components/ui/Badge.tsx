import { type HTMLAttributes } from 'react';

type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, { className: string; style: React.CSSProperties }> = {
  neutral: {
    className: 'text-neutral-200',
    style: {
      backgroundColor: 'rgba(48, 54, 61, 0.45)',
      border: '1px solid rgba(139, 148, 158, 0.2)',
    },
  },
  primary: {
    className: 'text-primary-400',
    style: {
      backgroundColor: 'var(--nx-cyan-aura)',
      border: '1px solid var(--color-border-strong)',
    },
  },
  success: {
    className: 'text-success-400',
    style: {
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      border: '1px solid rgba(0, 255, 136, 0.25)',
    },
  },
  warning: {
    className: 'text-warning-400',
    style: {
      backgroundColor: 'rgba(255, 170, 0, 0.1)',
      border: '1px solid rgba(255, 170, 0, 0.25)',
    },
  },
  error: {
    className: 'text-error-400',
    style: {
      backgroundColor: 'rgba(255, 51, 102, 0.1)',
      border: '1px solid rgba(255, 51, 102, 0.25)',
    },
  },
  info: {
    className: 'text-info-400',
    style: {
      backgroundColor: 'var(--nx-cyan-aura)',
      border: '1px solid var(--color-border-strong)',
    },
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

function Badge({ variant = 'neutral', size = 'sm', className = '', style, children, ...props }: BadgeProps) {
  const variantConf = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantConf.className}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ ...variantConf.style, ...style }}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
