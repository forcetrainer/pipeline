import { type SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-neutral-100 tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            h-10 w-full px-3 pr-8
            border rounded-md
            text-neutral-50
            bg-neutral-800
            appearance-none
            bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20width%3D'16'%20height%3D'16'%20viewBox%3D'0%200%2024%2024'%20fill%3D'none'%20stroke%3D'%238b949e'%20stroke-width%3D'2'%3E%3Cpath%20d%3D'M6%209l6%206%206-6'%2F%3E%3C%2Fsvg%3E")]
            bg-[length:16px] bg-[right_12px_center] bg-no-repeat
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
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-error-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select, type SelectProps, type SelectOption };
