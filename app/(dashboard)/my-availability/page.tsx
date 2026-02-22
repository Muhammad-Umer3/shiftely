import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvailabilityCalendar } from '@/components/employees/availability-calendar'

export default async function MyAvailabilityPage() {
  const user = await requireAuth()

  const employee = await prisma.employee.findFirst({
    where: { userId: user.id, organizationId: user.organizationId },
  })

  return (
    <div className="space-y-6 text-stone-900">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">My availability</h1>
        <p className="text-stone-600 mt-1">
          Set when you are available to work. Managers use this when building schedules.
        </p>
      </div>

      {!employee ? (
        <Card className="border-stone-200 bg-white">
          <CardContent className="pt-6">
            <p className="text-sm text-stone-500">
              You don&apos;t have an employee record. Contact your manager to be added to the team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-stone-900">Weekly availability</CardTitle>
            <CardDescription className="text-stone-600">
              Select the time slots when you are available. Click a slot to toggle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar useSelf />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
