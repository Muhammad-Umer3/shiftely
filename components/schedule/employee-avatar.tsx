'use client'

import { cn } from '@/lib/utils/cn'

export function EmployeeAvatar({
  name,
  email,
  size = 'sm',
  className,
}: {
  name: string | null
  email: string
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  const display = name || email
  const initial = display.charAt(0).toUpperCase()

  const sizeClasses = {
    xs: 'h-5 w-5 text-[10px]',
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
  }

  return (
    <div
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center font-medium bg-amber-100 text-amber-800',
        sizeClasses[size],
        className
      )}
      title={display}
    >
      {initial}
    </div>
  )
}
