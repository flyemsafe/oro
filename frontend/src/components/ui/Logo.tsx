import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'gradient' | 'gold' | 'default'
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
}

const variantClasses = {
  gradient: 'bg-gradient-to-r from-oro-orange-500 to-oro-blue-500 bg-clip-text text-transparent',
  gold: 'text-oro-gold-500',
  default: 'text-foreground',
}

export function Logo({ className, size = 'md', variant = 'gradient' }: LogoProps) {
  return (
    <div className={cn('font-bold tracking-tight', sizeClasses[size], className)}>
      <span className={variantClasses[variant]}>
        Oro
      </span>
      <span className="text-oro-gold-500 ml-0.5 text-[0.6em] align-super">
        ◆
      </span>
    </div>
  )
}

export function LogoIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yoruba-inspired geometric pattern representing "Oro" (treasure/wealth) */}
      <defs>
        <linearGradient id="oro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f78f2a" />
          <stop offset="100%" stopColor="#3687d1" />
        </linearGradient>
      </defs>

      {/* Central diamond (represents precious treasure) */}
      <path
        d="M12 2L18 12L12 22L6 12L12 2Z"
        fill="url(#oro-gradient)"
        opacity="0.9"
      />

      {/* Inner golden accent */}
      <path
        d="M12 6L15 12L12 18L9 12L12 6Z"
        fill="#d4af37"
        opacity="0.7"
      />

      {/* Top accent line */}
      <line
        x1="12"
        y1="2"
        x2="12"
        y2="6"
        stroke="#d4af37"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
