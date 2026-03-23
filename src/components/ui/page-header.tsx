import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  iconClassName?: string
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-xl bg-primary/20 p-3',
              iconClassName
            )}
          >
            <Icon className="size-6 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
