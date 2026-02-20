'use client'

import { Calendar, Users, Brain, Bell, Clock, Zap, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: Brain,
    title: 'AI generates your schedule',
    description: 'Hours on spreadsheets? Add employees and availability—AI generates a fair schedule in minutes.',
    highlight: true,
  },
  {
    icon: Users,
    title: 'Simple availability calendar',
    description: 'No more digging through texts. One calendar for who can work when.',
  },
  {
    icon: Calendar,
    title: 'One place for everyone\'s shifts',
    description: 'Replace messy spreadsheets. One calendar, drag-and-drop tweaks when needed.',
  },
  {
    icon: Bell,
    title: 'Fewer no-shows',
    description: 'Notifications so the team always knows their shifts.',
  },
  {
    icon: Clock,
    title: 'Shift swaps in one click',
    description: 'Swap requests in texts? Approve or reject in one click, no back-and-forth.',
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
      className={`group relative p-8 rounded-2xl transition-all duration-500 cursor-pointer ${
        feature.highlight 
          ? 'glass-card border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent' 
          : 'glass-card hover:border-amber-500/20'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
          feature.highlight 
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30' 
            : 'bg-stone-800 group-hover:bg-amber-500/20'
        }`}>
          <Icon className={`h-7 w-7 ${feature.highlight ? 'text-stone-950' : 'text-amber-400'}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors">
          {feature.title}
        </h3>
        
        <p className="text-stone-400 leading-relaxed">
          {feature.description}
        </p>

        {feature.highlight && (
          <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-medium">
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-stone-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything you need to run shifts
            <span className="block gradient-text">without the headache</span>
          </h2>
          <p className="text-lg text-stone-400">
            Built for how you actually run your business
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm0-30c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zM6 4c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm0 30c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
            
            <div className="relative p-10 md:p-16">
              <p className="text-stone-950/80 text-center mb-4">
                Built so you spend less time scheduling and more time running your business.
              </p>
              <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center text-stone-950">
                Why Small Teams Choose Shiftely
              </h3>
              <div className="grid md:grid-cols-3 gap-10 text-center">
                <div className="space-y-2">
                  <div className="text-5xl md:text-6xl font-bold text-stone-950">Hours</div>
                  <div className="text-stone-950/70 font-medium">Saved Per Week</div>
                </div>
                <div className="space-y-2">
                  <div className="text-5xl md:text-6xl font-bold text-stone-950">Fewer</div>
                  <div className="text-stone-950/70 font-medium">Scheduling Conflicts</div>
                </div>
                <div className="space-y-2">
                  <div className="text-5xl md:text-6xl font-bold text-stone-950">5 min</div>
                  <div className="text-stone-950/70 font-medium">Setup Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
