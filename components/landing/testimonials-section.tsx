'use client'

import { useEffect, useRef, useState } from 'react'
import { Clock, Zap, CheckCircle } from 'lucide-react'

export function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="testimonials" className="py-24 bg-stone-900 relative overflow-hidden" ref={sectionRef}>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Why teams switch
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Managers who got their
            <span className="block gradient-text">time back</span>
          </h2>
          <p className="text-lg text-stone-400">
            Based on feedback from managers using Shiftely—less time on spreadsheets, fewer no-shows, one place for schedules.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center p-8 rounded-2xl glass-card border border-stone-800 hover:border-amber-500/20 transition-colors">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-4">
              <Clock className="h-7 w-7 text-amber-400" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">Hours back</div>
            <p className="text-stone-400 text-sm">every week—no more building schedules from scratch</p>
          </div>
          <div className="text-center p-8 rounded-2xl glass-card border border-stone-800 hover:border-amber-500/20 transition-colors">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-4">
              <Zap className="h-7 w-7 text-amber-400" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">5 min</div>
            <p className="text-stone-400 text-sm">to your first schedule—no IT, no training</p>
          </div>
          <div className="text-center p-8 rounded-2xl glass-card border border-stone-800 hover:border-amber-500/20 transition-colors">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-4">
              <CheckCircle className="h-7 w-7 text-amber-400" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">Zero</div>
            <p className="text-stone-400 text-sm">scheduling drama—one source of truth, everyone notified</p>
          </div>
        </div>
      </div>
    </section>
  )
}
