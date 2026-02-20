import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I create my first schedule?',
        a: 'Navigate to the Schedule page and click "Create Schedule". Select the week you want to schedule and start adding shifts.',
      },
      {
        q: 'How do I add employees?',
        a: 'Go to the Employees page and click "Invite Member". Enter their email address and they\'ll receive an invitation to create their account and join your organization.',
      },
      {
        q: 'What is the onboarding wizard?',
        a: 'The onboarding wizard helps you set up your organization, add employees, create your first schedule, and invite team members.',
      },
    ],
  },
  {
    category: 'Scheduling',
    questions: [
      {
        q: 'How does AI scheduling work?',
        a: 'Our AI analyzes employee availability, skills, and workload to suggest optimal shift assignments. You can accept, modify, or reject suggestions.',
      },
      {
        q: 'Can I copy a previous schedule?',
        a: 'Yes, you can use previous schedules as templates when creating new ones.',
      },
      {
        q: 'How do I publish a schedule?',
        a: 'Once you\'re satisfied with your schedule, click the "Publish" button. Employees will be notified of their shifts.',
      },
    ],
  },
  {
    category: 'Employees',
    questions: [
      {
        q: 'How do employees request shift swaps?',
        a: 'Employees can request to swap shifts from their dashboard. Managers will receive a notification to approve or reject the request.',
      },
      {
        q: 'Can I set employee availability?',
        a: 'Yes, you can set availability templates for employees and they can update their availability as needed.',
      },
      {
        q: 'What are employee roles?',
        a: 'Roles help organize your team and can be used to assign appropriate shifts. You can create custom roles in Settings.',
      },
    ],
  },
  {
    category: 'Billing & Subscription',
    questions: [
      {
        q: 'What happens if I exceed my employee limit?',
        a: 'You\'ll receive a notification when approaching your limit. To add more employees, upgrade your plan.',
      },
      {
        q: 'Can I cancel my subscription?',
        a: 'Yes, you can cancel your subscription at any time from the Settings page. You\'ll be downgraded to the Free plan.',
      },
      {
        q: 'How do I update my payment method?',
        a: 'You can update your payment method through the Billing Portal in Settings.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Frequently Asked Questions</h1>
        <p className="text-stone-600 mt-1">Find answers to common questions</p>
      </div>

      <div className="space-y-8">
        {faqs.map((category) => (
          <Card key={category.category} className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="text-stone-900">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
