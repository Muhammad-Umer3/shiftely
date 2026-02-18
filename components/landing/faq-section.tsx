import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'How does the AI scheduling work?',
    answer: 'Our AI analyzes employee availability, skills, and workload to suggest optimal shift assignments. You can accept, modify, or reject suggestions.',
  },
  {
    question: 'Can employees swap shifts?',
    answer: 'Yes! Employees can request shift swaps, and managers can approve or reject them. This feature is available on all paid plans.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Currently, Shiftely works great on mobile browsers. A dedicated mobile app is coming soon!',
  },
  {
    question: 'What happens if I exceed my employee limit?',
    answer: 'You\'ll receive a notification when approaching your limit. To add more employees, simply upgrade your plan.',
  },
  {
    question: 'Can I export my schedule data?',
    answer: 'Yes! Paid plans include CSV export functionality for payroll and reporting purposes.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
  },
]

export function FAQSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about Shiftely
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
