'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface RatingStarsProps {
  rating: number
  onRatingChange?: (rating: number) => void
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  showLabel?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
}

export function RatingStars({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  interactive = false,
  showLabel = false,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null)
    }
  }

  const displayRating = hoverRating ?? rating

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= displayRating
          const isPartiallyFilled =
            starValue > displayRating && starValue - 1 < displayRating

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={cn(
                'relative transition-all',
                interactive && 'cursor-pointer hover:scale-110',
                !interactive && 'cursor-default'
              )}
              aria-label={`Rate ${starValue} out of ${maxRating}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-oro-gold-500 text-oro-gold-500'
                    : 'fill-none text-muted-foreground'
                )}
              />
              {isPartiallyFilled && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: `${(displayRating - starValue + 1) * 100}%`,
                  }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      'fill-oro-gold-500 text-oro-gold-500'
                    )}
                  />
                </div>
              )}
            </button>
          )
        })}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground ml-1">
          {displayRating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  )
}

export function RatingDisplay({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) {
  return (
    <RatingStars
      rating={rating}
      maxRating={maxRating}
      interactive={false}
      showLabel={true}
      size="sm"
    />
  )
}
