'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  return (
    <section className="bg-stone-900 relative overflow-hidden">
      {/* Final CTA block */}
      <div className="py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start your first schedule in 5 minutes
          </h2>
          <p className="text-lg text-stone-400 max-w-xl mx-auto mb-10">
            Try free—no card required. Add your team, set availability, and let AI build the schedule.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-lg shadow-amber-500/25"
              >
                Start free
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-stone-600 text-stone-300 hover:bg-stone-800 hover:border-amber-500/30 hover:text-amber-400"
              >
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="pt-16 pb-8 border-t border-stone-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-stone-950" />
              </div>
              <span className="text-xl font-bold text-white">Shiftely</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
              <Link href="/privacy" className="text-stone-500 hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-stone-500 hover:text-amber-400 transition-colors">
                Cookies
              </Link>
              <Link href="/contact" className="text-stone-500 hover:text-amber-400 transition-colors">
                Contact
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-stone-600">
              © {new Date().getFullYear()} Shiftely. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </section>
  )
}
