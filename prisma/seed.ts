import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, setHours, startOfWeek } from 'date-fns'
import {
  ALL_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from '../lib/permissions/permissions'

const prisma = new PrismaClient()

// Demo login password for all seeded users (e.g. admin@demo.shiftely.com). Document in README.
const DEMO_PASSWORD = 'Demo123!'

async function main() {
  console.log('Seeding permissions and roles...')

  // 1. Create all permissions
  console.log('Creating permissions...')
  const permissionMap = new Map<string, string>()

  for (const permission of ALL_PERMISSIONS) {
    const [resource, action] = permission.split(':')
    const description = PERMISSION_DESCRIPTIONS[permission] || `${action} ${resource}`

    const created = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
      update: {
        description,
      },
      create: {
        resource,
        action,
        description,
      },
    })

    permissionMap.set(permission, created.id)
    console.log(`  ✓ ${permission}`)
  }

  // 2. Get all organizations; if none exist, create demo org + users + employees (and optional groups/schedule)
  let organizations = await prisma.organization.findMany()

  if (organizations.length === 0) {
    console.log('\nNo organizations found. Creating demo organization and users...')
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

    const demoOrg = await prisma.organization.create({
      data: {
        name: 'Shiftely Demo',
        subscriptionTier: 'FREE',
        settings: {},
      },
    })

    const demoUsers: Array<{
      email: string
      name: string
      role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
      roleType?: string
      hourlyRate?: number
    }> = [
      { email: 'admin@demo.shiftely.com', name: 'Demo Admin', role: 'ADMIN' },
      { email: 'manager@demo.shiftely.com', name: 'Demo Manager', role: 'MANAGER' },
      { email: 'employee1@demo.shiftely.com', name: 'Alex Employee', role: 'EMPLOYEE', roleType: 'Server', hourlyRate: 18.5 },
      { email: 'employee2@demo.shiftely.com', name: 'Sam Employee', role: 'EMPLOYEE', roleType: 'Host', hourlyRate: 16 },
      { email: 'employee3@demo.shiftely.com', name: 'Jordan Employee', role: 'EMPLOYEE', roleType: 'Server', hourlyRate: 18.5 },
    ]

    const createdEmployees: { userId: string; employeeId: string }[] = []

    for (const u of demoUsers) {
      const user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          passwordHash,
          role: u.role,
          organizationId: demoOrg.id,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          employee: {
            create: {
              organizationId: demoOrg.id,
              roleType: u.roleType ?? null,
              hourlyRate: u.hourlyRate ?? null,
            },
          },
        },
        include: { employee: true },
      })
      if (user.employee) {
        createdEmployees.push({ userId: user.id, employeeId: user.employee.id })
      }
      console.log(`  ✓ Created ${u.role.toLowerCase()} ${u.email}`)
    }

    // Employee groups for demo
    const frontOfHouse = await prisma.employeeGroup.create({
      data: { name: 'Front of House', organizationId: demoOrg.id },
    })
    const backOffice = await prisma.employeeGroup.create({
      data: { name: 'Back Office', organizationId: demoOrg.id },
    })
    const adminUser = await prisma.user.findFirst({
      where: { organizationId: demoOrg.id, role: 'ADMIN' },
      include: { employee: true },
    })
    const employeeIds = createdEmployees.map((e) => e.employeeId)
    await prisma.employeeGroupMember.createMany({
      data: [
        { groupId: frontOfHouse.id, employeeId: employeeIds[2]! },
        { groupId: frontOfHouse.id, employeeId: employeeIds[3]! },
        { groupId: backOffice.id, employeeId: employeeIds[3]! },
        { groupId: backOffice.id, employeeId: employeeIds[4]! },
      ],
    })
    console.log('  ✓ Created groups: Front of House, Back Office')

    // One week schedule with slots and assignments
    if (adminUser?.employee) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const schedule = await prisma.schedule.create({
        data: {
          organizationId: demoOrg.id,
          type: 'WEEK',
          weekStartDate: weekStart,
          name: 'Demo Week',
          status: 'DRAFT',
          createdById: adminUser.id,
        },
      })
      const slotData = [
        { dayOffset: 0, startHour: 9, endHour: 17 },
        { dayOffset: 1, startHour: 9, endHour: 17 },
        { dayOffset: 2, startHour: 14, endHour: 22 },
        { dayOffset: 3, startHour: 9, endHour: 17 },
      ]
      for (let i = 0; i < slotData.length; i++) {
        const { dayOffset, startHour, endHour } = slotData[i]!
        const day = addDays(weekStart, dayOffset)
        const startTime = setHours(day, startHour)
        const endTime = setHours(day, endHour)
        const slot = await prisma.slot.create({
          data: {
            organizationId: demoOrg.id,
            scheduleId: schedule.id,
            startTime,
            endTime,
            requiredCount: 1,
            status: 'SCHEDULED',
            createdById: adminUser.id,
          },
        })
        const assignEmployeeId = employeeIds[i % employeeIds.length]!
        await prisma.slotAssignment.create({
          data: {
            slotId: slot.id,
            employeeId: assignEmployeeId,
            slotIndex: 0,
          },
        })
      }
      console.log('  ✓ Created demo schedule with 4 slots and assignments')
    }

    organizations = await prisma.organization.findMany()
  }

  console.log(`\nCreating default roles for ${organizations.length} organization(s)...`)

  for (const org of organizations) {
    // Create Admin role
    const adminPermissions = DEFAULT_ROLE_PERMISSIONS.ADMIN.map(
      (p) => permissionMap.get(p)!
    )

    const adminRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: 'Admin',
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: 'Admin',
        description: 'Full access to all features and settings',
        isSystemRole: true,
        rolePermissions: {
          create: adminPermissions.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        rolePermissions: true,
      },
    })

    console.log(`  ✓ Created Admin role for ${org.name}`)

    // Create Manager role
    const managerPermissions = DEFAULT_ROLE_PERMISSIONS.MANAGER.map(
      (p) => permissionMap.get(p)!
    )

    const managerRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: 'Manager',
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: 'Manager',
        description: 'Can manage schedules, employees, and shifts',
        isSystemRole: true,
        rolePermissions: {
          create: managerPermissions.map((permissionId) => ({
            permissionId,
          })),
        },
      },
    })

    console.log(`  ✓ Created Manager role for ${org.name}`)

    // Create Employee role
    const employeePermissions = DEFAULT_ROLE_PERMISSIONS.EMPLOYEE.map(
      (p) => permissionMap.get(p)!
    )

    const employeeRole = await prisma.role.upsert({
      where: {
        organizationId_name: {
          organizationId: org.id,
          name: 'Employee',
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: 'Employee',
        description: 'Basic access to view own schedule and request swaps',
        isSystemRole: true,
        rolePermissions: {
          create: employeePermissions.map((permissionId) => ({
            permissionId,
          })),
        },
      },
    })

    console.log(`  ✓ Created Employee role for ${org.name}`)

    // 3. Migrate existing users to new role system
    const users = await prisma.user.findMany({
      where: { organizationId: org.id },
    })

    console.log(`  Migrating ${users.length} user(s) to new role system...`)

    for (const user of users) {
      let roleToAssign = employeeRole

      // Map old role enum to new roles
      if (user.role === 'ADMIN') {
        roleToAssign = adminRole
      } else if (user.role === 'MANAGER') {
        roleToAssign = managerRole
      }

      // Check if user already has this role
      const existing = await prisma.userRoleAssignment.findUnique({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: roleToAssign.id,
          },
        },
      })

      if (!existing) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: user.id,
            roleId: roleToAssign.id,
            assignedById: user.id, // Self-assigned during migration
          },
        })
        console.log(`    ✓ Assigned ${roleToAssign.name} role to ${user.email}`)
      }
    }
  }

  console.log('\n✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
