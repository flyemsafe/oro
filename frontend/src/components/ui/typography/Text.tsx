import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'muted' | 'small' | 'large' | 'lead'
  as?: 'p' | 'span' | 'div'
  children: React.ReactNode
}

const variantStyles = {
  default: 'text-base text-foreground',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs text-muted-foreground',
  large: 'text-lg text-foreground',
  lead: 'text-xl text-muted-foreground leading-relaxed',
}

export function Text({
  variant = 'default',
  as: Component = 'p',
  className,
  children,
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
