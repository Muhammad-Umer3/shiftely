'use client'

import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    question: 'How does the AI scheduling work?',
    answer: 'Our AI analyzes employee availability, skills, preferences, and historical data to suggest optimal shift assignments. It learns from your scheduling patterns and improves over time. You can accept, modify, or reject any suggestions.',
  },
  {
    question: 'Can employees swap shifts?',
    answer: 'Yes! Employees can request shift swaps directly through the platform, and managers can approve or reject them with a single click. The system automatically checks for conflicts before allowing swaps. This feature is available on all paid plans.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Currently, Shiftely works great on mobile browsers with a fully responsive design. Employees can view schedules, request time off, and swap shifts from any device. A dedicated mobile app is coming soon!',
  },
  {
    question: 'What happens if I exceed my employee limit?',
    answer: 'You\'ll receive a friendly notification when you\'re approaching your limit. If you need to add more employees, you can easily upgrade your plan with a single click. No data is ever lost during plan changes.',
  },
  {
    question: 'Can I export my schedule data?',
    answer: 'Yes! Paid plans include CSV export functionality for payroll integration and reporting purposes. You can export schedules, hours worked, and employee data in various formats compatible with major payroll systems.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Absolutely! All paid plans come with a 14-day free trial with full access to all features. No credit card is required to start your trial. If you decide not to continue, your account will simply convert to our Free plan.',
  },
]

function FAQItem({ faq, isOpen, onClick }: { faq: typeof faqs[0], isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-stone-800 last:border-0">
      <button
        className="w-full py-6 flex items-center justify-between text-left group"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-white group-hover:text-amber-400 transition-colors pr-8">
          {faq.question}
        </span>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center transition-all group-hover:border-amber-500/50 ${
          isOpen ? 'bg-amber-500 border-amber-500' : ''
        }`}>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-stone-950' : 'text-stone-400 group-hover:text-amber-400'
          }`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
      }`}>
        <p className="text-stone-400 leading-relaxed pr-16">
          {faq.answer}
        </p>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 bg-stone-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block text-amber-400 text-sm font-semibold tracking-wider uppercase mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently asked
              <span className="block gradient-text">questions</span>
            </h2>
            <p className="text-lg text-stone-400">
              Everything you need to know about Shiftely
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 md:p-10">
            {faqs.map((faq, idx) => (
              <FAQItem
                key={idx}
                faq={faq}
                isOpen={openIndex === idx}
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 text-center">
            <p className="text-stone-400 mb-4">Still have questions?</p>
            <Link href="/help/contact">
              <Button variant="outline" className="border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
