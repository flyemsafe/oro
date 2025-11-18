import { cn } from '@/lib/utils'
import { type HTMLAttributes, type ElementType } from 'react'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  gradient?: boolean
  children: React.ReactNode
}

const levelStyles = {
  1: 'text-4xl md:text-5xl font-bold',
  2: 'text-3xl md:text-4xl font-semibold',
  3: 'text-2xl md:text-3xl font-semibold',
  4: 'text-xl md:text-2xl font-medium',
  5: 'text-lg md:text-xl font-medium',
  6: 'text-base md:text-lg font-medium',
}

export function Heading({
  level = 1,
  gradient = false,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as ElementType

  return (
    <Tag
      className={cn(
        'tracking-tight',
        levelStyles[level],
        gradient && 'bg-gradient-to-r from-oro-orange-500 to-oro-blue-500 bg-clip-text text-transparent',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
