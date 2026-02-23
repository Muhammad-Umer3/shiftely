'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useNotFound } from '@/components/providers/not-found-provider'

const HIDE_PATHS = ['/contact', '/terms', '/privacy', '/cookies', '/schedules', '/schedule', '/employees', '/swaps', '/time-off', '/settings', '/onboarding', '/help']

export function ContactFloatButton() {
  const pathname = usePathname()
  const notFound = useNotFound()
  const isHidden =
    notFound?.isNotFound ||
    pathname === '/contact' ||
    HIDE_PATHS.some((p) => pathname?.startsWith(p))
  if (isHidden) return null

  return (
    <Link
      href="/contact"
      className="fixed bottom-7 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all cursor-pointer"
      aria-label="Contact us"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Contact</span>
    </Link>
  )
}
