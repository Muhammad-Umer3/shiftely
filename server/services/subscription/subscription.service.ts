import { prisma } from '@/lib/db/prisma'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

type TierKey = keyof typeof SUBSCRIPTION_TIERS

/**
 * Effective tier: Pro during active trial, otherwise stored subscriptionTier
 */
function getEffectiveTier(
  subscriptionTier: string,
  trialEndsAt: Date | null
): TierKey {
  if (trialEndsAt && new Date() < trialEndsAt) {
    return 'PRO'
  }
  return subscriptionTier as TierKey
}

export class SubscriptionService {
  /**
   * Get subscription tier info for an organization (uses effective tier during trial)
   */
  static async getSubscriptionInfo(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        employees: true,
        schedules: true, // Count all schedules for limit (FREE: 1 total)
      },
    })

    if (!organization) {
      throw new Error('Organization not found')
    }

    const tier = getEffectiveTier(
      organization.subscriptionTier,
      organization.trialEndsAt
    ) as TierKey
    const tierInfo = SUBSCRIPTION_TIERS[tier]

    const currentEmployeeCount = organization.employees.length
    const currentScheduleCount = organization.schedules.length

    return {
      tier,
      tierInfo,
      subscriptionTier: organization.subscriptionTier as TierKey,
      trialEndsAt: organization.trialEndsAt,
      isTrialing: !!organization.trialEndsAt && new Date() < organization.trialEndsAt,
      currentEmployeeCount,
      currentScheduleCount,
      employeeLimit: tierInfo.employeeLimit,
      scheduleLimit: tierInfo.scheduleLimit,
      canAddEmployee: currentEmployeeCount < tierInfo.employeeLimit,
      canAddSchedule: tierInfo.scheduleLimit === null || currentScheduleCount < tierInfo.scheduleLimit,
    }
  }

  /**
   * Check if organization can add an employee
   */
  static async canAddEmployee(organizationId: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
  }> {
    const info = await this.getSubscriptionInfo(organizationId)

    if (info.canAddEmployee) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: `You've reached the employee limit for your ${info.tierInfo.name} plan (${info.employeeLimit} employees).`,
      upgradeRequired: true,
    }
  }

  /**
   * Check if organization can add a schedule
   */
  static async canAddSchedule(organizationId: string): Promise<{
    allowed: boolean
    reason?: string
    upgradeRequired?: boolean
  }> {
    const info = await this.getSubscriptionInfo(organizationId)

    if (info.canAddSchedule) {
      return { allowed: true }
    }

    return {
      allowed: false,
      reason: info.scheduleLimit === 1
        ? 'Only 1 schedule is allowed on the Free plan. Upgrade to create more.'
        : `You've reached the schedule limit for your ${info.tierInfo.name} plan (${info.scheduleLimit} active schedules).`,
      upgradeRequired: true,
    }
  }

  /**
   * Check if organization has access to a feature (uses effective tier during trial)
   */
  static async hasFeatureAccess(
    organizationId: string,
    feature: 'ai_suggestions' | 'ai_recommendations'
  ): Promise<boolean> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { subscriptionTier: true, trialEndsAt: true },
    })

    if (!organization) {
      return false
    }

    const tier = getEffectiveTier(
      organization.subscriptionTier,
      organization.trialEndsAt
    )

    // FREE tier has no premium features
    if (tier === 'FREE') {
      return false
    }

    // All paid tiers (and Pro trial) have access to these features
    return true
  }
}
