import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: scheduleId } = await params
    const { searchParams } = new URL(req.url)
    const formatType = searchParams.get('format') || 'csv'

    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId: user.organizationId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    })

    if (!schedule) {
      return NextResponse.json({ message: 'Schedule not found' }, { status: 404 })
    }

    if (formatType === 'csv') {
      const rows: string[][] = [
        ['Employee', 'Date', 'Start', 'End', 'Hours', 'Position'],
      ]

      for (const slot of schedule.slots) {
        for (const a of slot.assignments) {
          if (!a.employeeId) continue
          const emp = a.employee
          const name = emp?.user?.name || emp?.user?.email || 'Unknown'
          const start = new Date(slot.startTime)
          const end = new Date(slot.endTime)
          const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2)
          rows.push([
            name,
            format(start, 'yyyy-MM-dd'),
            format(start, 'HH:mm'),
            format(end, 'HH:mm'),
            hours,
            slot.position || '',
          ])
        }
      }

      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="schedule-${scheduleId}-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
        },
      })
    }

    if (formatType === 'pdf') {
      const html = buildPrintHtml(schedule)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="schedule-${scheduleId}.html"`,
        },
      })
    }

    return NextResponse.json({ message: 'Invalid format. Use csv or pdf' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    )
  }
}

function buildPrintHtml(schedule: {
  name: string | null
  weekStartDate: Date | null
  slots: Array<{
    startTime: Date
    endTime: Date
    position: string | null
    assignments: Array<{
      employee: { name?: string | null; phone?: string | null; user?: { name: string | null; email: string } | null } | null
    }>
  }>
}) {
  const weekStart = schedule.weekStartDate
    ? format(new Date(schedule.weekStartDate), 'MMMM d, yyyy')
    : 'Schedule'
  const title = schedule.name?.trim() || `Week of ${weekStart}`

  const rows = schedule.slots.flatMap((slot) =>
    slot.assignments
      .filter((a) => a.employee)
      .map((a) => {
        const emp = a.employee!
        const name = emp.user?.name || emp.user?.email || emp.name || emp.phone || '—'
        const start = new Date(slot.startTime)
        const end = new Date(slot.endTime)
        const hours = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)
        return {
          name,
          date: format(start, 'EEE, MMM d'),
          time: `${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`,
          hours,
          position: slot.position || '—',
        }
      })
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1c1917; }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    .subtitle { color: #78716c; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e7e5e4; padding: 8px 12px; text-align: left; }
    th { background: #fafaf9; font-weight: 600; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">${weekStart}</p>
  <table>
    <thead>
      <tr><th>Employee</th><th>Date</th><th>Time</th><th>Hours</th><th>Position</th></tr>
    </thead>
    <tbody>
      ${rows.map((r) => `<tr><td>${r.name}</td><td>${r.date}</td><td>${r.time}</td><td>${r.hours}</td><td>${r.position}</td></tr>`).join('')}
    </tbody>
  </table>
  <script>window.onload=function(){window.print()}</script>
</body>
</html>`
}
