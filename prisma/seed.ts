import { PrismaClient } from '@prisma/client'
import {
  ALL_PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from '../lib/permissions/permissions'

const prisma = new PrismaClient()

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

  // 2. Get all organizations
  const organizations = await prisma.organization.findMany()

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
