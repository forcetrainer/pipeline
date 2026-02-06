import { type InputHTMLAttributes, forwardRef } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (query: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ onSearch, className = '', onChange, ...props }, ref) => {
    return (
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none"
        />
        <input
          ref={ref}
          type="search"
          className={`
            h-10 w-full pl-10 pr-4
            border border-neutral-500 rounded-md
            text-neutral-50 placeholder:text-neutral-400
            bg-neutral-800
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-primary-500
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
          onChange={(e) => {
            onChange?.(e);
            onSearch?.(e.target.value);
          }}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export { SearchBar, type SearchBarProps };
