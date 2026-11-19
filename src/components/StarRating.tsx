import React from 'react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showNumeric?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showNumeric = false,
}) => {
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((index) => {
          const filled = rating >= index - 0.25;
          const half = !filled && rating >= index - 0.75;

          return (
            <svg
              key={index}
              className={starSize}
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-${index}-${rating}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="50%" stopColor="#E58900" />
                      <stop offset="50%" stopColor="#DDE1E4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 1.5l2.58 5.23 5.77.84-4.17 4.07.98 5.75L10 14.67l-5.16 2.72.98-5.75L1.65 7.57l5.77-.84L10 1.5z"
                    fill={`url(#half-${index}-${rating})`}
                  />
                </>
              ) : (
                <path
                  d="M10 1.5l2.58 5.23 5.77.84-4.17 4.07.98 5.75L10 14.67l-5.16 2.72.98-5.75L1.65 7.57l5.77-.84L10 1.5z"
                  fill={filled ? '#E58900' : '#DDE1E4'}
                />
              )}
            </svg>
          );
        })}
      </div>

      {showNumeric && (
        <span className="text-xs font-semibold text-[#1A1D1E] tabular-nums">{rating.toFixed(1)}</span>
      )}

      {typeof reviewCount === 'number' && (
        <span className="text-xs text-[#5A6266] tabular-nums">
          ({reviewCount.toLocaleString('en-SG')})
        </span>
      )}
    </div>
  );
};
