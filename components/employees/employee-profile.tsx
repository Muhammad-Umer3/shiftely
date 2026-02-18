'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvailabilityCalendar } from '@/components/employees/availability-calendar'

type EmployeeWithUser = {
  id: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  }
  roleType: string | null
  hourlyRate: number | null
  shifts?: Array<{
    id: string
    startTime: Date
    endTime: Date
    position: string | null
  }>
}

export function EmployeeProfile({ employee }: { employee: EmployeeWithUser }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{employee.user.email}</p>
          </div>
          {employee.user.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-lg">{employee.user.phone}</p>
            </div>
          )}
          {employee.roleType && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-lg">{employee.roleType}</p>
            </div>
          )}
          {employee.hourlyRate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hourly Rate</p>
              <p className="text-lg">${employee.hourlyRate.toString()}/hr</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Set when this employee is available to work</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityCalendar employeeId={employee.id} />
        </CardContent>
      </Card>

      {employee.shifts && employee.shifts.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employee.shifts?.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(shift.startTime).toLocaleTimeString()} -{' '}
                      {new Date(shift.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{shift.position || 'Shift'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
