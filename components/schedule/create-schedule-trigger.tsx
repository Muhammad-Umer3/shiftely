'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export function CreateScheduleTrigger({ weekStart }: { weekStart: string }) {
  const searchParams = useSearchParams()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    if (searchParams.get('create') !== 'true') return

    hasRun.current = true
    window.dispatchEvent(
      new CustomEvent('open-create-schedule', { detail: { weekStart } })
    )
  }, [searchParams, weekStart])

  return null
}
