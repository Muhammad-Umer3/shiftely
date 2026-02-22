'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeSlots = [
  '6:00 AM',
  '7:00 AM',
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
  '10:00 PM',
]

type Props =
  | { employeeId: string; useSelf?: false }
  | { employeeId?: string; useSelf: true }

export function AvailabilityCalendar(props: Props) {
  const { employeeId, useSelf = false } = props
  const [availability, setAvailability] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (useSelf) {
      fetch('/api/me/availability')
        .then((r) => r.json())
        .then((data) => setAvailability(data.availability ?? {}))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else if (employeeId) {
      fetch(`/api/employees/${employeeId}/availability`)
        .then((r) => r.json())
        .then((data) => setAvailability(data.availability ?? {}))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [useSelf, employeeId])

  const toggleTimeSlot = (day: string, time: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || []
      const isSelected = daySlots.includes(time)
      return {
        ...prev,
        [day]: isSelected ? daySlots.filter((t) => t !== time) : [...daySlots, time],
      }
    })
  }

  const saveAvailability = async () => {
    const url = useSelf ? '/api/me/availability' : `/api/employees/${employeeId}/availability`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })

      if (response.ok) {
        toast.success('Availability saved!')
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.message || 'Failed to save availability')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading availability…</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 overflow-x-auto">
        {daysOfWeek.map((day) => (
          <div key={day} className="space-y-2">
            <p className="text-sm font-medium text-center">{day.slice(0, 3)}</p>
            <div className="space-y-1">
              {timeSlots.map((time) => {
                const isSelected = availability[day]?.includes(time)
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleTimeSlot(day, time)}
                    className={`w-full p-1 text-xs rounded ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={saveAvailability} className="w-full">
        Save Availability
      </Button>
    </div>
  )
}
