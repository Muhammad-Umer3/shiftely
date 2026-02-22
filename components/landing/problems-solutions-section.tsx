'use client'

import { AlertCircle, Calendar, MessageSquare, Briefcase, FileSpreadsheet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const problemSolutionPairs = [
  {
    problem: 'Hours wasted on spreadsheets, WhatsApp, and last-minute fire drills',
    solution: 'One place for schedules and availability. AI drafts in minutes—you tweak, not build from zero.',
    icon: Calendar,
  },
  {
    problem: '"I didn\'t know I was working"—no-shows and confused staff',
    solution: 'Email and WhatsApp notifications. One shared calendar, one source of truth.',
    icon: AlertCircle,
  },
  {
    problem: 'Swap and time-off requests lost in texts and emails',
    solution: 'Request and approve swaps and time off in the app. One click.',
    icon: MessageSquare,
  },
  {
    problem: 'Re-keying hours into payroll or missing overtime until payday',
    solution: 'One-click CSV export. See weekly hours and overtime before you publish.',
    icon: FileSpreadsheet,
  },
  {
    problem: 'Scheduling feels like a second (unpaid) job',
    solution: 'Add people, set availability, hit publish. No IT. Live in minutes.',
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
      className={`group relative p-6 rounded-2xl transition-all duration-300 glass-card border border-stone-800 hover:border-amber-500/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-stone-800">
          <Icon className="h-6 w-6 text-amber-400" />
        </div>
        <p className="text-white font-semibold text-lg mb-3 leading-snug">{pair.problem}</p>
        <p className="text-stone-400 text-sm leading-relaxed">{pair.solution}</p>
      </div>
    </div>
  )
}

export function ProblemsSolutionsSection() {
  return (
    <section id="problems" className="py-24 bg-stone-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Sound familiar?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The scheduling headaches
            <span className="block gradient-text">we eliminate</span>
          </h2>
          <p className="text-lg text-stone-400">
            We built Shiftely around the real pain of running shifts—so you spend less time on schedules and more time on what actually grows your business.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {problemSolutionPairs.map((pair, index) => (
            <ProblemSolutionCard key={pair.problem} pair={pair} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
