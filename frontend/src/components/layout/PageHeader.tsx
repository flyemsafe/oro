import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  gradient?: boolean
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  gradient = false,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 mb-8', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h1
            className={cn(
              'text-3xl md:text-4xl font-bold tracking-tight',
              gradient &&
                'bg-gradient-to-r from-oro-orange-500 to-oro-blue-500 bg-clip-text text-transparent'
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
