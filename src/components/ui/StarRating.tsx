import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
}

function StarRating({ value, onChange, max = 5, size = 20, readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={`Rating: ${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readonly}
            className={`
              p-0.5 rounded-sm
              transition-all duration-200
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              ${!readonly && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'}
            `}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              ...(isFilled ? { filter: 'drop-shadow(0 0 4px rgba(255, 170, 0, 0.5))' } : {}),
            }}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
            role={readonly ? undefined : 'radio'}
            aria-checked={readonly ? undefined : starValue === value}
          >
            <Star
              size={size}
              className={`
                transition-colors duration-200
                ${isFilled ? 'fill-warning-500 text-warning-500' : 'fill-none text-neutral-400'}
              `}
            />
          </button>
        );
      })}
    </div>
  );
}

export { StarRating, type StarRatingProps };
