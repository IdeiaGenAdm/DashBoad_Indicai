'use client'

import { cn } from '@/lib/utils'

import { Skeleton } from './skeleton'

type Variant = 'table-rows' | 'cards'

interface LoadingSkeletonProps {
  variant?: Variant
  rowCount?: number
  className?: string
}

export function LoadingSkeleton({ variant = 'table-rows', rowCount = 5, className }: LoadingSkeletonProps) {
  if (variant === 'table-rows') {
    return (
      <div className={cn('space-y-0 rounded-md border', className)}>
        <div className="flex border-b bg-primary/10 p-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b p-4 last:border-b-0">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return null
}
