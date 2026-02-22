// Subscription tier definitions - safe to import on client side
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    employeeLimit: 5,
    scheduleLimit: 1,
    features: [
      'AI builds your schedule in minutes',
      'Email & WhatsApp notifications—fewer no-shows',
      'CSV export for payroll',
      'Overtime & conflict warnings',
      'Up to 5 employees',
      '1 active schedule',
      'One place for shifts & availability',
    ],
  },
  GROWTH: {
    name: 'Growth',
    price: 29,
    employeeLimit: 15,
    scheduleLimit: null,
    features: [
      'Everything in Free',
      'Up to 15 employees',
      'Unlimited schedules',
      'Shift swap requests—approve in one click',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 79,
    employeeLimit: 100,
    scheduleLimit: null,
    features: [
      'Everything in Growth',
      'Up to 100 employees',
      'Custom roles & permissions',
      'Priority support',
    ],
  },
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
