import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/middleware/error-handler'

export async function GET() {
  try {
    const user = await requireAuth()

    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 })
    }

    const settings = (organization.settings as Record<string, unknown>) || {}
    const onboardingCompleted = Boolean(settings.onboardingCompleted)
    const rawStep = settings.onboardingStep
    let onboardingStep =
      typeof rawStep === 'number' && rawStep >= 1 && rawStep <= 5 ? rawStep : 1

    if (!onboardingCompleted) {
      const [employeeCount, scheduleCount] = await Promise.all([
        prisma.employee.count({ where: { organizationId: user.organizationId } }),
        prisma.schedule.count({ where: { organizationId: user.organizationId } }),
      ])
      if (employeeCount >= 1 && onboardingStep < 2) onboardingStep = 2
      if (scheduleCount >= 1 && onboardingStep < 3) onboardingStep = 3
    }

    return NextResponse.json({
      onboardingCompleted,
      onboardingStep,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
