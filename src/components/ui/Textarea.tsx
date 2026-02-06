import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-neutral-100 tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 min-h-[80px]
            border rounded-md
            bg-neutral-800 text-neutral-50
            placeholder:text-neutral-400
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-primary-500
            disabled:opacity-50 disabled:bg-neutral-900
            resize-y
            ${error ? 'border-error-500' : 'border-neutral-500'}
            ${className}
          `}
          style={{ fontFamily: 'var(--font-sans)' }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = 'var(--nx-glow-cyan)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '';
            props.onBlur?.(e);
          }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-sm text-error-400" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="text-sm text-neutral-300">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export { Textarea, type TextareaProps };
