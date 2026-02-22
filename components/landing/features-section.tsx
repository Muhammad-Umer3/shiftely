'use client'

import { Calendar, Users, Brain, Bell, Clock, FileDown, AlertTriangle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: Brain,
    title: 'AI builds your schedule in minutes',
    description: 'Add your team and availability. AI creates a fair draft—you review and publish.',
    highlight: true,
  },
  {
    icon: Users,
    title: 'One availability calendar',
    description: 'See who can work when in one place. No more digging through texts and DMs.',
  },
  {
    icon: Calendar,
    title: 'One place for every shift',
    description: 'Single source of truth. Drag-and-drop tweaks when life happens.',
  },
  {
    icon: Bell,
    title: 'Fewer no-shows, less confusion',
    description: 'Email and WhatsApp when schedules publish. Everyone sees their shifts.',
  },
  {
    icon: FileDown,
    title: 'One-click CSV export for payroll',
    description: 'Export with employee, date, time, hours. No re-keying.',
  },
  {
    icon: AlertTriangle,
    title: 'Overtime and conflict warnings',
    description: 'Spot over 40 hours and conflicts before you publish.',
  },
  {
    icon: Clock,
    title: 'Shift swaps in one click',
    description: 'Request, approve, or reject in the app. No group-chat chase.',
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  const Icon = feature.icon
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      className={`group relative p-6 rounded-2xl transition-all duration-300 border ${
        feature.highlight 
          ? 'glass-card border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent' 
          : 'glass-card border-stone-800 hover:border-amber-500/20'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="relative z-10">
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
          feature.highlight 
            ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
            : 'bg-stone-800'
        }`}>
          <Icon className={`h-6 w-6 ${feature.highlight ? 'text-stone-950' : 'text-amber-400'}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-white mb-2">
          {feature.title}
        </h3>
        
        <p className="text-stone-400 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-stone-900 relative overflow-hidden">

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to run shifts
            <span className="block gradient-text">without the headache</span>
          </h2>
          <p className="text-lg text-stone-400">
            Built for how small teams actually work—simple, fast, no IT required.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Stats strip - compact, sourced */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600">
            <div className="relative p-6 md:p-10">
              <h3 className="text-lg font-bold text-center text-stone-950 mb-1">
                Why teams switch to Shiftely
              </h3>
              <p className="text-center text-stone-950/70 text-sm mb-6">Based on feedback from managers using Shiftely</p>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-stone-950">Hours</div>
                  <div className="text-stone-950/70 text-sm font-medium">Back every week</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-stone-950">Zero</div>
                  <div className="text-stone-950/70 text-sm font-medium">Scheduling drama</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-stone-950">5 min</div>
                  <div className="text-stone-950/70 text-sm font-medium">To first schedule</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
