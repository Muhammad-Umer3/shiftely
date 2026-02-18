'use client'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl border border-stone-200 bg-white',
        className
      )}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2 text-stone-900">{title}</h3>
      {description && (
        <p className="text-sm text-stone-600 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold">
              {action.label}
            </Button>
          </Link>
        ) : action.onClick ? (
          <Button onClick={action.onClick} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold">
            {action.label}
          </Button>
        ) : null
      )}
    </div>
  )
}
