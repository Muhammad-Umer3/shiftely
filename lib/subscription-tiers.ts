// Subscription tier definitions - safe to import on client side
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    employeeLimit: 5,
    scheduleLimit: 1,
    features: [
      'Core scheduling',
      'Basic notifications',
      'Up to 5 employees',
      '1 active schedule',
    ],
  },
  GROWTH: {
    name: 'Growth',
    price: 29,
    employeeLimit: 15,
    scheduleLimit: null,
    features: [
      'All Free features',
      'Up to 15 employees',
      'Unlimited schedules',
      'AI schedule suggestions',
      'Shift swap requests',
      'Overtime alerts',
      'Basic analytics',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 79,
    employeeLimit: 100,
    scheduleLimit: null,
    features: [
      'All Growth features',
      'Up to 100 employees',
      'Advanced AI recommendations',
      'CSV payroll export',
      'Advanced analytics',
      'Custom roles & permissions',
      'Priority support',
    ],
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
