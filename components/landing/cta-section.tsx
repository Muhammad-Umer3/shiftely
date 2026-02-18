import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                Ready to save 10+ hours per week?
              </h2>
              <p className="text-lg md:text-xl leading-8 text-blue-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of teams using Shiftely to eliminate scheduling headaches and focus on what matters most.
              </p>

              {/* Key benefits */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-blue-100">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-300" />
                  <span>Cancel anytime</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-10 py-7 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all font-semibold"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full sm:w-auto text-lg px-10 py-7 bg-transparent border-2 border-white text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <p className="mt-8 text-sm text-blue-200">
                Trusted by 500+ businesses • 4.8/5 average rating • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
