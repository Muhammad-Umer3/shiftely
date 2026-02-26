'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Check, Calendar, Clock, Users, Zap } from 'lucide-react'

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
            <span>Built for small teams. Live in 5 minutes.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-in-up delay-100">
            <span className="text-white">Stop chasing shifts.</span>
            <br />
            <span className="gradient-text">AI builds your schedule</span>
            <br />
            <span className="text-white">in minutes.</span>
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl leading-relaxed text-stone-400 max-w-2xl mx-auto animate-fade-in-up delay-200">
            Add your team, set availability once. AI builds fair schedules—you get hours back, they show up.
          </p>
          <p className="mt-3 text-base text-stone-500 max-w-xl mx-auto animate-fade-in-up delay-200">
            One-click payroll export. Overtime visible before you publish.
          </p>
          <p className="mt-2 text-sm text-stone-500 max-w-xl mx-auto animate-fade-in-up delay-200">
            7-day free trial on Growth—no credit card required.
          </p>

          {/* Key Benefits */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-stone-500 animate-fade-in-up delay-300">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Fewer no-shows &amp; confusion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Time back every week</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Swaps &amp; time off in one place</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-400" />
              </div>
              <span>Free to start—no card required</span>
            </div>
          </div>

          {/* CTA - Get started */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up delay-400">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-10 py-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all animate-pulse-glow"
              >
                Get started
              </Button>
            </Link>
            <Link
              href="/#features"
              className="text-base font-medium text-stone-400 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-stone-600 hover:decoration-amber-500/50"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-sm text-stone-500 animate-fade-in-up delay-400">
            No card required. Join managers who save hours every week.
          </p>

          {/* Product preview - browser-style frame with schedule mock */}
          <div className="mt-16 mx-auto max-w-4xl animate-fade-in-up delay-500">
            <div className="rounded-2xl border border-stone-700/80 bg-stone-900/90 shadow-2xl shadow-black/40 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-800 bg-stone-900/80">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-stone-600" />
                  <div className="w-3 h-3 rounded-full bg-stone-600" />
                  <div className="w-3 h-3 rounded-full bg-stone-600" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-stone-500 font-medium">app.shiftely.com/schedules</span>
                </div>
              </div>
              {/* Mock schedule content */}
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 w-32 rounded-lg bg-stone-800" />
                  <div className="h-9 w-36 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-xs font-medium text-amber-400">Generate with AI</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-stone-800 rounded-lg overflow-hidden">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="bg-stone-900/80 py-3 text-center">
                      <span className="text-xs font-medium text-stone-500">{day}</span>
                    </div>
                  ))}
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-stone-800/50 py-4 px-2 flex items-center justify-center"
                      style={{ minHeight: 48 }}
                    >
                      {i % 4 === 0 && (
                        <div className="w-full max-w-[80%] h-6 rounded bg-amber-500/20 border border-amber-500/30" />
                      )}
                      {i % 4 === 2 && (
                        <div className="w-full max-w-[60%] h-6 rounded bg-stone-700 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-stone-500">Your schedule—tweak and publish in one place</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 pt-12 border-t border-stone-800 animate-fade-in-up delay-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">Small teams</div>
                <div className="text-sm text-stone-500 mt-1">Built for you</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">Minutes</div>
                <div className="text-sm text-stone-500 mt-1">Not hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">Zero</div>
                <div className="text-sm text-stone-500 mt-1">Scheduling drama</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">5 min</div>
                <div className="text-sm text-stone-500 mt-1">To first schedule</div>
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
