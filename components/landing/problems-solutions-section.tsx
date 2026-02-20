'use client'

import { AlertCircle, Calendar, MessageSquare, Briefcase, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const problemSolutionPairs = [
  {
    problem: 'Hours lost to spreadsheets, WhatsApp, and last-minute changes',
    solution: 'One place for schedules and availability; AI generates in minutes so you tweak, not build from scratch.',
    icon: Calendar,
  },
  {
    problem: '"I didn\'t know I was working" — no-shows and confusion',
    solution: 'Notifications so everyone sees their shifts; one calendar for the whole team.',
    icon: AlertCircle,
  },
  {
    problem: 'Swap and time-off requests buried in texts and emails',
    solution: 'Request and approve swaps and time off in the app; one click, no chasing.',
    icon: MessageSquare,
  },
  {
    problem: 'Scheduling feels like a second job',
    solution: 'Built for small teams: add people, set availability, publish. No IT, no complexity.',
    icon: Briefcase,
  },
]

function ProblemSolutionCard({
  pair,
  index,
}: {
  pair: (typeof problemSolutionPairs)[0]
  index: number
}) {
  const Icon = pair.icon
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (cardRef.current) observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`group relative p-8 rounded-2xl transition-all duration-500 glass-card hover:border-amber-500/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-stone-800 group-hover:bg-amber-500/20 transition-all duration-300">
          <Icon className="h-7 w-7 text-amber-400" />
        </div>
        <p className="text-stone-400 text-sm font-medium mb-2 flex items-center gap-2">
          <span className="text-amber-400/80">The problem</span>
          <ArrowRight className="w-4 h-4 opacity-60" />
        </p>
        <p className="text-white font-medium mb-4">{pair.problem}</p>
        <p className="text-amber-400/90 text-sm font-medium mb-2">How Shiftely helps</p>
        <p className="text-stone-400 leading-relaxed">{pair.solution}</p>
      </div>
    </div>
  )
}

export function ProblemsSolutionsSection() {
  return (
    <section id="problems" className="py-24 bg-stone-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Problems
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Problems we
            <span className="block gradient-text">solve</span>
          </h2>
          <p className="text-lg text-stone-400">
            We built Shiftely around the real pains of running shifts—so you spend less time scheduling and more time running your business.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {problemSolutionPairs.map((pair, index) => (
            <ProblemSolutionCard key={pair.problem} pair={pair} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
