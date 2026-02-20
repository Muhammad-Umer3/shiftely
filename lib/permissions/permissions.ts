/**
 * Permission definitions for the RBAC system
 * Format: {resource}:{action}
 */

export type Permission = string

export const PERMISSIONS = {
  // Schedule permissions
  SCHEDULE_VIEW: 'schedule:view',
  SCHEDULE_CREATE: 'schedule:create',
  SCHEDULE_EDIT: 'schedule:edit',
  SCHEDULE_DELETE: 'schedule:delete',
  SCHEDULE_PUBLISH: 'schedule:publish',
  SCHEDULE_UNPUBLISH: 'schedule:unpublish',

  // Shift permissions
  SHIFT_VIEW: 'shift:view',
  SHIFT_CREATE: 'shift:create',
  SHIFT_EDIT: 'shift:edit',
  SHIFT_DELETE: 'shift:delete',
  SHIFT_ASSIGN: 'shift:assign',

  // Employee permissions
  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_EDIT: 'employee:edit',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_VIEW_AVAILABILITY: 'employee:view_availability',
  EMPLOYEE_MANAGE_AVAILABILITY: 'employee:manage_availability',

  // Shift Swap permissions
  SWAP_VIEW: 'swap:view',
  SWAP_REQUEST: 'swap:request',
  SWAP_APPROVE: 'swap:approve',
  SWAP_REJECT: 'swap:reject',

  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_MANAGE_ROLES: 'settings:manage_roles',
  SETTINGS_MANAGE_SUBSCRIPTION: 'settings:manage_subscription',

  // AI permissions
  AI_USE_SUGGESTIONS: 'ai:use_suggestions',
  AI_USE_RECOMMENDATIONS: 'ai:use_recommendations',
} as const

export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  [PERMISSIONS.SCHEDULE_VIEW]: 'View schedules',
  [PERMISSIONS.SCHEDULE_CREATE]: 'Create new schedules',
  [PERMISSIONS.SCHEDULE_EDIT]: 'Edit existing schedules',
  [PERMISSIONS.SCHEDULE_DELETE]: 'Delete schedules',
  [PERMISSIONS.SCHEDULE_PUBLISH]: 'Publish schedules',
  [PERMISSIONS.SCHEDULE_UNPUBLISH]: 'Unpublish schedules',

  [PERMISSIONS.SHIFT_VIEW]: 'View shifts',
  [PERMISSIONS.SHIFT_CREATE]: 'Create shifts',
  [PERMISSIONS.SHIFT_EDIT]: 'Edit shifts',
  [PERMISSIONS.SHIFT_DELETE]: 'Delete shifts',
  [PERMISSIONS.SHIFT_ASSIGN]: 'Assign employees to shifts',

  [PERMISSIONS.EMPLOYEE_VIEW]: 'View employees',
  [PERMISSIONS.EMPLOYEE_CREATE]: 'Add new employees',
  [PERMISSIONS.EMPLOYEE_EDIT]: 'Edit employee details',
  [PERMISSIONS.EMPLOYEE_DELETE]: 'Remove employees',
  [PERMISSIONS.EMPLOYEE_VIEW_AVAILABILITY]: 'View employee availability',
  [PERMISSIONS.EMPLOYEE_MANAGE_AVAILABILITY]: 'Manage employee availability',

  [PERMISSIONS.SWAP_VIEW]: 'View swap requests',
  [PERMISSIONS.SWAP_REQUEST]: 'Request shift swaps',
  [PERMISSIONS.SWAP_APPROVE]: 'Approve swap requests',
  [PERMISSIONS.SWAP_REJECT]: 'Reject swap requests',

  [PERMISSIONS.SETTINGS_VIEW]: 'View organization settings',
  [PERMISSIONS.SETTINGS_EDIT]: 'Edit organization settings',
  [PERMISSIONS.SETTINGS_MANAGE_ROLES]: 'Manage roles and permissions',
  [PERMISSIONS.SETTINGS_MANAGE_SUBSCRIPTION]: 'Manage subscription',

  [PERMISSIONS.AI_USE_SUGGESTIONS]: 'Use AI schedule suggestions',
  [PERMISSIONS.AI_USE_RECOMMENDATIONS]: 'Use AI employee recommendations',
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

export const PERMISSIONS_BY_RESOURCE: Record<string, Permission[]> = {
  schedule: [
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.SCHEDULE_DELETE,
    PERMISSIONS.SCHEDULE_PUBLISH,
    PERMISSIONS.SCHEDULE_UNPUBLISH,
  ],
  shift: [
    PERMISSIONS.SHIFT_VIEW,
    PERMISSIONS.SHIFT_CREATE,
    PERMISSIONS.SHIFT_EDIT,
    PERMISSIONS.SHIFT_DELETE,
    PERMISSIONS.SHIFT_ASSIGN,
  ],
  employee: [
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.EMPLOYEE_DELETE,
    PERMISSIONS.EMPLOYEE_VIEW_AVAILABILITY,
    PERMISSIONS.EMPLOYEE_MANAGE_AVAILABILITY,
  ],
  swap: [
    PERMISSIONS.SWAP_VIEW,
    PERMISSIONS.SWAP_REQUEST,
    PERMISSIONS.SWAP_APPROVE,
    PERMISSIONS.SWAP_REJECT,
  ],
  settings: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.SETTINGS_MANAGE_ROLES,
    PERMISSIONS.SETTINGS_MANAGE_SUBSCRIPTION,
  ],
  ai: [PERMISSIONS.AI_USE_SUGGESTIONS, PERMISSIONS.AI_USE_RECOMMENDATIONS],
}

/**
 * Default role permissions
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  ADMIN: ALL_PERMISSIONS,
  MANAGER: [
    // Schedule
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SCHEDULE_EDIT,
    PERMISSIONS.SCHEDULE_PUBLISH,
    PERMISSIONS.SCHEDULE_UNPUBLISH,
    // Shift
    PERMISSIONS.SHIFT_VIEW,
    PERMISSIONS.SHIFT_CREATE,
    PERMISSIONS.SHIFT_EDIT,
    PERMISSIONS.SHIFT_DELETE,
    PERMISSIONS.SHIFT_ASSIGN,
    // Employee (except delete)
    PERMISSIONS.EMPLOYEE_VIEW,
    PERMISSIONS.EMPLOYEE_CREATE,
    PERMISSIONS.EMPLOYEE_EDIT,
    PERMISSIONS.EMPLOYEE_VIEW_AVAILABILITY,
    PERMISSIONS.EMPLOYEE_MANAGE_AVAILABILITY,
    // Swap
    PERMISSIONS.SWAP_VIEW,
    PERMISSIONS.SWAP_REQUEST,
    PERMISSIONS.SWAP_APPROVE,
    PERMISSIONS.SWAP_REJECT,
    // Settings (view only, no role/subscription management)
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
    // AI
    PERMISSIONS.AI_USE_SUGGESTIONS,
    PERMISSIONS.AI_USE_RECOMMENDATIONS,
  ],
  EMPLOYEE: [
    // Limited schedule view (own schedule)
    PERMISSIONS.SCHEDULE_VIEW,
    // Limited shift view (own shifts)
    PERMISSIONS.SHIFT_VIEW,
    // Swap requests
    PERMISSIONS.SWAP_VIEW,
    PERMISSIONS.SWAP_REQUEST,
  ],
} as const
