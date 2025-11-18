'use client'

import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface DateDisplayProps {
  date: string | Date
  format?: 'relative' | 'short' | 'long' | 'full'
  className?: string
  prefix?: string
}

export function DateDisplay({
  date,
  format: displayFormat = 'relative',
  className,
  prefix,
}: DateDisplayProps) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date

  if (!isValid(dateObj)) {
    return <span className={cn('text-muted-foreground', className)}>Invalid date</span>
  }

  const getFormattedDate = () => {
    switch (displayFormat) {
      case 'relative':
        return formatDistanceToNow(dateObj, { addSuffix: true })
      case 'short':
        return format(dateObj, 'MMM d, yyyy')
      case 'long':
        return format(dateObj, 'MMMM d, yyyy h:mm a')
      case 'full':
        return format(dateObj, 'EEEE, MMMM d, yyyy h:mm:ss a')
      default:
        return formatDistanceToNow(dateObj, { addSuffix: true })
    }
  }

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={cn('text-sm text-muted-foreground', className)}
      title={format(dateObj, 'EEEE, MMMM d, yyyy h:mm:ss a')}
    >
      {prefix && `${prefix} `}
      {getFormattedDate()}
    </time>
  )
}
