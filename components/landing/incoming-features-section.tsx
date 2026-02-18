'use client'

import { Smartphone, MessageSquare, Clock, Globe } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const INCOMING_FEATURES = [
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Native iOS and Android apps for employees to view schedules, request swaps, and get push notifications on the go.',
  },
  {
    icon: Clock,
    title: 'Clock In/Out',
    description: 'Time tracking with actual clock-in and clock-out times. Replace scheduled hours with real worked hours for payroll.',
  },
  {
    icon: MessageSquare,
    title: 'SMS Notifications',
    description: 'Text alerts for schedule changes, shift reminders, and swap requests. Reach your team even when they\'re not checking email.',
  },
  {
    icon: Globe,
    title: 'Multi-language Support',
    description: 'Full support for Spanish, French, and more. Serve diverse teams in their preferred language.',
  },
]

function IncomingFeatureCard({
  feature,
  index,
}: {
  feature: (typeof INCOMING_FEATURES)[0]
  index: number
}) {
  const Icon = feature.icon
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
      className={`group relative p-8 rounded-2xl transition-all duration-500 glass-card border-stone-700/50 hover:border-amber-500/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-4 right-4">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Coming soon
        </span>
      </div>
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-stone-800 group-hover:bg-amber-500/20 transition-all duration-300">
        <Icon className="h-7 w-7 text-amber-400/80" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors">
        {feature.title}
      </h3>
      <p className="text-stone-400 leading-relaxed">{feature.description}</p>
    </div>
  )
}

export function IncomingFeaturesSection() {
  return (
    <section id="coming-soon" className="py-24 bg-stone-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Coming Soon
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What we&apos;re
            <span className="block gradient-text">building next</span>
          </h2>
          <p className="text-lg text-stone-400">
            Features we&apos;re working on based on customer feedback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {INCOMING_FEATURES.map((feature, index) => (
            <IncomingFeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
