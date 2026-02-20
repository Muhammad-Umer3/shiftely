'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check, Calendar, Clock, Users, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-stone-950 noise-overlay">
      {/* Animated background elements */}
      <div className="absolute inset-0 spotlight" />
      <div className="absolute inset-0 grid-pattern" />
      
      {/* Floating orbs */}
      <div className="absolute top-32 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl animate-float delay-300" />
      
      {/* Floating icons */}
      <div className="absolute top-40 right-[15%] hidden lg:block animate-float delay-200">
        <div className="glass-card p-4 rounded-2xl">
          <Calendar className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <div className="absolute top-60 left-[12%] hidden lg:block animate-float delay-500">
        <div className="glass-card p-4 rounded-2xl">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>
      <div className="absolute bottom-40 right-[20%] hidden lg:block animate-float delay-700">
        <div className="glass-card p-4 rounded-2xl">
          <Users className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-10 animate-fade-in-up">
            <Zap className="h-4 w-4" />
            <span>Built for small teams—no IT required</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in-up delay-100">
            <span className="text-white">Get your time back—</span>
            <span className="gradient-text">AI schedules</span>
            <br />
            <span className="text-white">in minutes, not hours</span>
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-stone-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Spreadsheets, missed shifts, and last-minute chaos don&apos;t scale. Add your team, set availability, and let AI build schedules that actually work.
          </p>

          {/* Key Benefits */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-stone-500 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Fewer no-shows</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Less time on spreadsheets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>One place for swaps and time off</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Free to start</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up delay-400">
            <Link href="/#pricing" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all animate-pulse-glow"
              >
                See pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/#features" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto text-lg px-10 py-7 border-2 border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
              >
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-20 pt-12 border-t border-stone-800 animate-fade-in-up delay-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">SME</div>
                <div className="text-sm text-stone-500 mt-1">Focused</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">Simple</div>
                <div className="text-sm text-stone-500 mt-1">Scheduling</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">Fewer</div>
                <div className="text-sm text-stone-500 mt-1">Conflicts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">5 min</div>
                <div className="text-sm text-stone-500 mt-1">Setup Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-900 to-transparent" />
    </section>
  )
}
