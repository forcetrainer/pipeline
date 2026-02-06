import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-100 tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-10 w-full px-3
            border rounded-md
            bg-neutral-800 text-neutral-50
            placeholder:text-neutral-400
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-primary-500
            disabled:opacity-50 disabled:bg-neutral-900
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
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-error-400" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-neutral-300">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input, type InputProps };
