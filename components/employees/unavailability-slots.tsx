'use client'

import { useState, useEffect } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
]

export function UnavailabilitySlots({ employeeId }: { employeeId: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [unavailability, setUnavailability] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const dayName = DAY_NAMES[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]

  useEffect(() => {
    fetch(`/api/employees/${employeeId}/availability`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.availability && typeof data.availability === 'object') {
          const avail = data.availability as Record<string, string[]>
          const hasData = Object.keys(avail).length > 0
          const unavail: Record<string, string[]> = {}
          DAY_NAMES.forEach((day) => {
            const availableSlots = avail[day] || []
            unavail[day] = hasData ? TIME_SLOTS.filter((t) => !availableSlots.includes(t)) : []
          })
          setUnavailability(unavail)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [employeeId])

  const dayUnavailable = unavailability[dayName] || []
  const toggleSlot = (time: string) => {
    setUnavailability((prev) => {
      const current = prev[dayName] || []
      const isUnavailable = current.includes(time)
      return {
        ...prev,
        [dayName]: isUnavailable
          ? current.filter((t) => t !== time)
          : [...current, time],
      }
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      const availability: Record<string, string[]> = {}
      DAY_NAMES.forEach((day) => {
        const unavailable = unavailability[day] || []
        availability[day] = TIME_SLOTS.filter((t) => !unavailable.includes(t))
      })
      const res = await fetch(`/api/employees/${employeeId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })
      if (res.ok) {
        toast.success('Unavailability saved')
      } else {
        toast.error('Failed to save')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse h-48 rounded-lg bg-stone-200" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="border-stone-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-stone-900 min-w-[140px] text-center">
            {format(selectedDate, 'EEE, MMM d')}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="border-stone-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={save} disabled={saving} size="sm" className="bg-amber-500 hover:bg-amber-600 text-stone-950">
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <p className="text-xs text-stone-500">
        Tap slots when this employee is <strong>not</strong> available. Filled = unavailable.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {TIME_SLOTS.map((time) => {
          const isUnavailable = dayUnavailable.includes(time)
          return (
            <button
              key={time}
              type="button"
              onClick={() => toggleSlot(time)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                isUnavailable
                  ? 'bg-rose-100 border-rose-300 text-rose-800'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {time}
            </button>
          )
        })}
      </div>
    </div>
  )
}
