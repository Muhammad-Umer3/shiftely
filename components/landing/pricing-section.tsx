import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Start free, upgrade when you're ready. No credit card required.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
            const isPopular = key === 'GROWTH'
            const isFree = key === 'FREE'
            
            return (
              <Card 
                key={key} 
                className={`relative transition-all hover:shadow-xl ${
                  isPopular 
                    ? 'border-2 border-blue-500 shadow-lg scale-105 md:scale-110' 
                    : 'border'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className={isPopular ? 'pt-8' : ''}>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    {!isFree && <span className="text-muted-foreground text-lg">/month</span>}
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {isFree 
                      ? 'Perfect for getting started' 
                      : `Up to ${tier.employeeLimit} employees`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8 min-h-[200px]">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          isPopular ? 'text-blue-600' : 'text-green-500'
                        }`} />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isFree ? (
                    <Link href="/register" className="block">
                      <Button className="w-full" variant="outline" size="lg">
                        Get Started Free
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register" className="block">
                      <Button 
                        className={`w-full ${
                          isPopular 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                            : ''
                        }`}
                        size="lg"
                        variant={isPopular ? 'default' : 'default'}
                      >
                        Start 14-Day Free Trial
                      </Button>
                    </Link>
                  )}
                  {!isFree && (
                    <p className="text-xs text-center text-gray-500 mt-3">
                      No credit card required • Cancel anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">30-day money-back guarantee</span> on all paid plans. 
            Not satisfied? Get a full refund, no questions asked.
          </p>
        </div>
      </div>
    </section>
  )
}
