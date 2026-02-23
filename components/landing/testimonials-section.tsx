'use client'

import { useEffect, useRef, useState } from 'react'
import { UtensilsCrossed, Store, Stethoscope, Coffee, Scissors, Warehouse } from 'lucide-react'

const businesses = [
  {
    icon: UtensilsCrossed,
    name: 'Restaurants & cafes',
    description: 'Front and back of house, split shifts, and last-minute coverage.',
  },
  {
    icon: Store,
    name: 'Retail',
    description: 'Stores, malls, and seasonal peaks—one schedule for the whole team.',
  },
  {
    icon: Stethoscope,
    name: 'Healthcare & clinics',
    description: 'Nurses, reception, and support staff across shifts and locations.',
  },
  {
    icon: Coffee,
    name: 'Hospitality',
    description: 'Hotels, bars, and events with flexible and rotating shifts.',
  },
  {
    icon: Scissors,
    name: 'Salons & spas',
    description: 'Appointment-based staff and part-time stylists, same simple tool.',
  },
  {
    icon: Warehouse,
    name: 'Warehouses & logistics',
    description: 'Picking, packing, and delivery—day, night, and weekend coverage.',
  },
]

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
            Built for shift work
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Businesses that use
            <span className="block gradient-text">Shiftely</span>
          </h2>
          <p className="text-lg text-stone-400">
            From restaurants to retail to healthcare—any team that runs on shifts can get organized in minutes.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {businesses.map(({ icon: Icon, name, description }) => (
            <div
              key={name}
              className="text-center p-8 rounded-2xl glass-card border border-stone-800 hover:border-amber-500/20 transition-colors"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 mb-4">
                <Icon className="h-7 w-7 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-white mb-2">{name}</div>
              <p className="text-stone-400 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
