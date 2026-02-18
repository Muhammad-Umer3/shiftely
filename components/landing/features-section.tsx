import { Calendar, Users, Brain, Bell, Shield, TrendingUp, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Scheduling',
    description: 'Let AI analyze availability, skills, and preferences to suggest optimal schedules. Save hours every week.',
    highlight: true,
  },
  {
    icon: Calendar,
    title: 'Drag & Drop Interface',
    description: 'Intuitive calendar view makes scheduling as easy as dragging shifts. No learning curve required.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Complete employee profiles with availability tracking, roles, and skills. Everything in one place.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Automatic email notifications keep your team informed about schedule changes and shift updates.',
  },
  {
    icon: Shield,
    title: 'Compliance Built-In',
    description: 'Automatic overtime detection, hours tracking, and compliance alerts. Stay on the right side of labor laws.',
  },
  {
    icon: TrendingUp,
    title: 'Analytics & Insights',
    description: 'Track hours, costs, and efficiency metrics. Make data-driven decisions about your workforce.',
  },
  {
    icon: Clock,
    title: 'Shift Swaps',
    description: 'Employees can request shift swaps. Managers approve with one click. No more back-and-forth emails.',
  },
  {
    icon: Zap,
    title: 'Payroll Export',
    description: 'Export schedules to CSV for seamless payroll integration. Save time on manual data entry.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage shifts
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Powerful features designed to make shift scheduling effortless and save you time
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card 
                key={feature.title} 
                className={`transition-all hover:shadow-lg hover:-translate-y-1 ${
                  feature.highlight ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white' : ''
                }`}
              >
                <CardHeader>
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
                    feature.highlight 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Why Teams Choose Shiftely
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-blue-100">Hours Saved Per Week</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-blue-100">Reduction in Conflicts</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5 min</div>
                <div className="text-blue-100">Setup Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
