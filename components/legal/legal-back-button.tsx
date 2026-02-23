'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LegalBackButton() {
  const router = useRouter()

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleBack}
      className="fixed left-[max(1rem,calc((100vw-56rem)/2-3rem))] top-24 -ml-[30px] z-50 h-10 w-10 rounded-full border-border bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-600"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
}
