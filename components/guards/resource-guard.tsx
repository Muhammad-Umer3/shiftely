'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/lib/hooks/use-permissions'

interface ResourceGuardProps {
  resource: string
  action: string
  fallback?: ReactNode
  children: ReactNode
}

export function ResourceGuard({
  resource,
  action,
  fallback = null,
  children,
}: ResourceGuardProps) {
  const { canPerform } = usePermissions()

  if (!canPerform(resource, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
