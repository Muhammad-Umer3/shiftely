'use client'

import { Star, Quote } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Restaurant Manager',
    company: 'Cafe Delight',
    content: 'Shiftely has completely transformed how we manage our staff schedules. The AI suggestions save us 12+ hours every week, and we\'ve eliminated scheduling conflicts entirely.',
    rating: 5,
    metric: '12 hours saved/week',
    avatar: 'SJ',
  },
  {
    name: 'Mike Chen',
    role: 'Operations Director',
    company: 'Retail Plus',
    content: 'The best scheduling tool we\'ve used. It\'s intuitive, powerful, and our employees love the mobile notifications. Setup took less than 10 minutes.',
    rating: 5,
    metric: '10 min setup',
    avatar: 'MC',
  },
  {
    name: 'Emily Rodriguez',
    role: 'HR Manager',
    company: 'Service Co',
    content: 'Finally, a scheduling solution that actually understands our needs. The shift swap feature is a game-changer, and compliance tracking gives us peace of mind.',
    rating: 5,
    metric: 'Zero conflicts',
    avatar: 'ER',
  },
]

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0], index: number }) {
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
      className={`relative p-8 rounded-3xl glass-card transition-all duration-700 hover:border-amber-500/30 group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Quote icon */}
      <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote className="w-12 h-12 text-amber-400" />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-6">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      
      <p className="text-stone-300 mb-8 leading-relaxed text-lg">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      
      {/* Metric badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/20">
          {testimonial.metric}
        </span>
      </div>
      
      <div className="flex items-center gap-4 pt-6 border-t border-stone-800">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-bold">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-white">{testimonial.name}</p>
          <p className="text-sm text-stone-500">
            {testimonial.role}, {testimonial.company}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-stone-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Loved by teams
            <span className="block gradient-text">everywhere</span>
          </h2>
          
          {/* Average rating */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="h-6 w-px bg-stone-700" />
            <span className="text-xl font-bold text-white">4.8/5</span>
            <span className="text-stone-500">from 200+ reviews</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <TestimonialCard key={idx} testimonial={testimonial} index={idx} />
          ))}
        </div>

        {/* Trust logos */}
        <div className="mt-20 text-center">
          <p className="text-stone-500 text-sm mb-8">Trusted by teams at:</p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {['Restaurants', 'Retail Stores', 'Healthcare', 'Service Businesses'].map((industry) => (
              <div key={industry} className="text-stone-600 font-semibold text-lg tracking-wide hover:text-amber-400/50 transition-colors">
                {industry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
