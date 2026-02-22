'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UnavailabilitySlots } from '@/components/employees/unavailability-slots'
import { EmployeeDailyView } from '@/components/employees/employee-daily-view'
import { EmployeeLeavesList } from '@/components/employees/employee-leaves-list'

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
  defaultHoursPerWeek?: number | null
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
      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-stone-600">Email</p>
            <p className="text-lg text-stone-900">{employee.user.email}</p>
          </div>
          {employee.user.phone && (
            <div>
              <p className="text-sm font-medium text-stone-600">Phone</p>
              <p className="text-lg text-stone-900">{employee.user.phone}</p>
            </div>
          )}
          {employee.roleType && (
            <div>
              <p className="text-sm font-medium text-stone-600">Role</p>
              <p className="text-lg text-stone-900">{employee.roleType}</p>
            </div>
          )}
          {employee.hourlyRate != null && employee.hourlyRate > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-600">Hourly Rate</p>
              <p className="text-lg text-stone-900">${employee.hourlyRate.toString()}/hr</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-stone-600">Default hours per week</p>
            <p className="text-lg text-stone-900">{employee.defaultHoursPerWeek ?? 40}h</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Unavailable Slots</CardTitle>
          <CardDescription className="text-stone-600">Mark times when this employee is not available to work</CardDescription>
        </CardHeader>
        <CardContent>
          <UnavailabilitySlots employeeId={employee.id} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Daily View</CardTitle>
          <CardDescription className="text-stone-600">Shifts and leaves for this employee</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeDailyView employeeId={employee.id} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-900">Upcoming Leaves</CardTitle>
          <CardDescription className="text-stone-600">Time off that will be considered when scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeLeavesList employeeId={employee.id} />
        </CardContent>
      </Card>

      {employee.shifts && employee.shifts.length > 0 && (
        <Card className="md:col-span-2 border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-stone-900">Recent Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employee.shifts?.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-3 border border-stone-200 rounded-lg bg-stone-50/50">
                  <div>
                    <p className="font-medium text-stone-900">
                      {new Date(shift.startTime).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-stone-600">
                      {new Date(shift.startTime).toLocaleTimeString()} -{' '}
                      {new Date(shift.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="text-sm text-stone-600">{shift.position || 'Shift'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
