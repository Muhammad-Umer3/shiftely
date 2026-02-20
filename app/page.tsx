import { Navbar } from '@/components/landing/navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { ProblemsSolutionsSection } from '@/components/landing/problems-solutions-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { FAQSection } from '@/components/landing/faq-section'
import { CTASection } from '@/components/landing/cta-section'

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-stone-950 min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemsSolutionsSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
    </div>
  )
}
