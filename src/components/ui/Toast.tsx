import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: (id: string) => void;
}

const variantConfig: Record<ToastVariant, {
  icon: typeof CheckCircle;
  borderColor: string;
  iconClass: string;
  auraColor: string;
}> = {
  success: {
    icon: CheckCircle,
    borderColor: 'var(--nx-green-base)',
    iconClass: 'text-success-400',
    auraColor: 'rgba(0, 255, 136, 0.08)',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'var(--nx-red-base)',
    iconClass: 'text-error-400',
    auraColor: 'rgba(255, 51, 102, 0.08)',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'var(--nx-amber-base)',
    iconClass: 'text-warning-400',
    auraColor: 'rgba(255, 170, 0, 0.08)',
  },
  info: {
    icon: Info,
    borderColor: 'var(--nx-cyan-base)',
    iconClass: 'text-info-400',
    auraColor: 'var(--color-border-subtle)',
  },
};

function Toast({ id, message, variant = 'info', duration = 5000, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 200);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`
        flex items-center gap-3
        w-80 p-4
        rounded-lg
        transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{
        backgroundColor: 'var(--nx-void-panel)',
        borderLeft: `3px solid ${config.borderColor}`,
        border: `1px solid var(--color-border-default)`,
        borderLeftWidth: '3px',
        borderLeftColor: config.borderColor,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        backgroundImage: `linear-gradient(90deg, ${config.auraColor} 0%, transparent 40%)`,
      }}
    >
      <Icon size={20} className={`shrink-0 ${config.iconClass}`} />
      <p className="flex-1 text-sm text-neutral-50">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(id), 200);
        }}
        className="p-0.5 text-neutral-400 hover:text-neutral-50 transition-colors rounded"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export { Toast, type ToastProps, type ToastVariant };
