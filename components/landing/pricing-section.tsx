'use client'

import { Button } from '@/components/ui/button'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { useEffect, useRef, useState } from 'react'

export function PricingSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="pricing" className="py-24 bg-stone-950 relative overflow-hidden" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-20">
          <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start free. Scale when you&apos;re ready.
            <span className="block gradient-text">No surprises.</span>
          </h2>
          <p className="text-lg text-stone-400">
            No credit card to start. Try Growth free for 7 days, then upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier], index) => {
            const isPopular = key === 'GROWTH'
            const isFree = key === 'FREE'
            
            return (
              <div
                key={key}
                className={`relative rounded-3xl transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${isPopular ? 'lg:scale-105 lg:-translate-y-4' : ''}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Card */}
                <div className={`h-full p-8 rounded-3xl transition-all duration-300 ${
                  isPopular 
                    ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/5 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/10' 
                    : 'glass-card'
                }`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 text-xs font-bold px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <Sparkles className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className={isPopular ? 'pt-4' : ''}>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-stone-400 text-sm mb-6">
                      {isFree 
                        ? 'Try everything free—no card required' 
                        : isPopular 
                          ? '7-day free trial, no card · Scale to 15 employees'
                          : `Scale to ${tier.employeeLimit} employees`}
                    </p>
                    
                    <div className="mb-8">
                      {isFree ? (
                        <span className="text-lg font-medium text-stone-400">Free forever</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-white">${tier.price}</span>
                          <span className="text-lg font-medium text-stone-400">/mo</span>
                        </>
                      )}
                    </div>
                    
                    <ul className="space-y-4 mb-10">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'bg-amber-500/20' : 'bg-stone-800'
                          }`}>
                            <Check className={`h-3 w-3 ${isPopular ? 'text-amber-400' : 'text-emerald-400'}`} />
                          </div>
                          <span className="text-stone-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Link href="/register" className="block">
                      <Button 
                        className={`w-full py-6 text-base font-semibold transition-all ${
                          isPopular 
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-500/25' 
                            : 'border-2 border-stone-700 bg-transparent text-white hover:bg-stone-800 hover:border-stone-600'
                        }`}
                        variant={isPopular ? undefined : 'outline'}
                      >
                        {isFree ? 'Start free' : 'Get started'}
                      </Button>
                    </Link>
                    
                    <p className="text-xs text-center text-stone-500 mt-4">
                      {isFree 
                        ? 'No credit card · Free forever' 
                        : isPopular 
                          ? '7-day free trial, then $29/mo. Cancel anytime.'
                          : 'Billed monthly. Cancel anytime.'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
