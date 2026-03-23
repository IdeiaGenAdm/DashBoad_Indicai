'use client'

import Link from 'next/link'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from './button'

interface EmptyStateProps {
  icon?: LucideIcon
  message: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

export function EmptyState({ icon: Icon, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center text-muted-foreground',
        className
      )}
    >
      {Icon && <Icon className="size-12 shrink-0 opacity-50" aria-hidden />}
      <p className="text-sm font-medium">{message}</p>
      {action &&
        (action.href ? (
          <Button asChild variant="outline" size="sm">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  )
}
