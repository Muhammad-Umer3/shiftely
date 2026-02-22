'use client'

import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    question: 'How much does Shiftely cost?',
    answer: 'Free: up to 5 employees and 1 active schedule—no card required. Growth: $29/mo for up to 15 employees and unlimited schedules, plus shift swaps. Pro: $79/mo for up to 100 employees, custom roles, and priority support. Paid plans include a 7-day free trial.',
  },
  {
    question: 'I\'m drowning in spreadsheets and last-minute chaos. Will this actually help?',
    answer: 'Yes. Shiftely gives you one place for schedules and availability—no more retyping or chasing people. AI drafts your schedule in minutes so you tweak instead of build from zero. Your team gets notified so everyone sees their shifts; that means fewer no-shows and zero "I didn\'t know" excuses. Teams like yours report hours back every week and far fewer conflicts.',
  },
  {
    question: 'How does the AI scheduling work?',
    answer: 'Add your employees and set their availability (days and times they can work). When you need a schedule, click "Generate with AI." The AI builds a fair, conflict-free draft from everyone\'s availability. You review, tweak if needed, and publish. No technical skills—you\'re live in minutes.',
  },
  {
    question: 'Can I use this for payroll?',
    answer: 'Yes. Export any published schedule to CSV in one click—employee name, date, start time, end time, hours, and position. Use the file with your payroll system so you don\'t re-key hours.',
  },
  {
    question: 'How do I avoid accidental overtime?',
    answer: 'When you build a schedule, we show when someone is over 40 hours for the week and flag availability conflicts. You can fix it before publishing, so overtime never surprises you at payday.',
  },
  {
    question: 'Can employees swap shifts?',
    answer: 'Yes! Employees can request shift swaps directly through the platform, and managers can approve or reject them with a single click. The system automatically checks for conflicts before allowing swaps. This feature is available on Growth and Pro plans.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Currently, Shiftely works great on mobile browsers with a fully responsive design. Employees can view schedules and swap shifts from any device. A dedicated mobile app is coming soon!',
  },
  {
    question: 'What happens if I exceed my employee limit?',
    answer: 'You\'ll receive a friendly notification when you\'re approaching your limit. If you need to add more employees, you can easily upgrade your plan with a single click. No data is ever lost during plan changes.',
  },
  {
    question: 'Do I need technical skills to use Shiftely?',
    answer: 'No. Shiftely is built for small teams and busy managers. Add people, set availability, hit generate. No IT, no learning curve—you\'re creating schedules from day one.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'You can start completely free with no credit card. Paid plans include a 7-day free trial with full access. You\'re only charged after the trial—and you can cancel anytime before that.',
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
              Questions we hear
              <span className="block gradient-text">all the time</span>
            </h2>
            <p className="text-lg text-stone-400">
              Quick answers for managers and business owners
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
            <p className="text-stone-400 mb-4">Still have questions? We&apos;re here to help.</p>
            <Link href="/contact">
              <Button variant="outline" className="border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5">
                <MessageCircle className="w-4 h-4 mr-2" />
                Get in touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
