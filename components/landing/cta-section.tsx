'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 bg-stone-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden">
            {/* Card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.08'%3E%3Cpath d='M36 34c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm0-30c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zM6 4c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm0 30c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 opacity-20">
              <Sparkles className="w-20 h-20 text-stone-950" />
            </div>
            <div className="absolute bottom-10 left-10 opacity-20">
              <Sparkles className="w-16 h-16 text-stone-950" />
            </div>
            
            <div className="relative p-10 md:p-16 lg:p-20">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-950 mb-6">
                  Ready to save hours
                  <span className="block">every week?</span>
                </h2>
                <p className="text-lg md:text-xl font-medium text-stone-950/90 mb-2">
                  Join business owners who stopped chasing schedules.
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-stone-950/80 mb-10 max-w-2xl mx-auto">
                  Eliminate scheduling headaches and focus on what matters most.
                </p>

                {/* Key benefits */}
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mb-12 text-stone-950/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-950/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-stone-950" />
                    </div>
                    <span className="font-medium">7-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-950/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-stone-950" />
                    </div>
                    <span className="font-medium">Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-950/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-stone-950" />
                    </div>
                    <span className="font-medium">Setup in under 5 minutes</span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                  <Link href="/#pricing" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto text-lg px-12 py-8 bg-stone-950 text-amber-400 hover:bg-stone-900 shadow-2xl shadow-stone-950/30 transition-all font-semibold"
                    >
                      See pricing
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="w-full sm:w-auto text-lg px-12 py-8 bg-transparent border-2 border-stone-950/30 text-stone-950 hover:bg-stone-950/10 hover:border-stone-950/50 font-semibold"
                    >
                      Contact us
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <p className="mt-10 text-sm text-stone-950/60 font-medium">
                  Trusted by growing businesses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-16 border-t border-stone-800">
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
