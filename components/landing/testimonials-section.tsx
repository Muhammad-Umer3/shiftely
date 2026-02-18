import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Restaurant Manager',
    company: 'Cafe Delight',
    content: 'Shiftely has completely transformed how we manage our staff schedules. The AI suggestions save us 12+ hours every week, and we\'ve eliminated scheduling conflicts entirely.',
    rating: 5,
    metric: '12 hours saved/week',
  },
  {
    name: 'Mike Chen',
    role: 'Operations Director',
    company: 'Retail Plus',
    content: 'The best scheduling tool we\'ve used. It\'s intuitive, powerful, and our employees love the mobile notifications. Setup took less than 10 minutes.',
    rating: 5,
    metric: '10 min setup',
  },
  {
    name: 'Emily Rodriguez',
    role: 'HR Manager',
    company: 'Service Co',
    content: 'Finally, a scheduling solution that actually understands our needs. The shift swap feature is a game-changer, and compliance tracking gives us peace of mind.',
    rating: 5,
    metric: 'Zero conflicts',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by teams everywhere
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join 500+ businesses that trust Shiftely for their scheduling needs
          </p>
          {/* Average rating */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">4.8/5</span>
            <span className="text-gray-500">from 200+ reviews</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                {/* Metric badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {testimonial.metric}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
