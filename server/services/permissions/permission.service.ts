import { prisma } from '@/lib/db/prisma'
import { Permission } from '@/lib/permissions/permissions'

export class PermissionService {
  /**
   * Get all permissions for a user
   * Resolves permissions from all roles assigned to the user
   */
  static async getUserPermissions(userId: string, organizationId: string): Promise<Permission[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        role: {
          organizationId,
        },
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    // Collect all unique permissions from all user roles
    const permissions = new Set<Permission>()
    
    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        const permission = `${rolePermission.permission.resource}:${rolePermission.permission.action}` as Permission
        permissions.add(permission)
      }
    }

    return Array.from(permissions)
  }

  /**
   * Check if user has a specific permission
   */
  static async hasPermission(
    userId: string,
    organizationId: string,
    permission: Permission
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, organizationId)
    return userPermissions.includes(permission)
  }

  /**
   * Check if user has any of the required permissions
   */
  static async hasAnyPermission(
    userId: string,
    organizationId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, organizationId)
    return permissions.some((permission) => userPermissions.includes(permission))
  }

  /**
   * Check if user has all required permissions
   */
  static async hasAllPermissions(
    userId: string,
    organizationId: string,
    permissions: Permission[]
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, organizationId)
    return permissions.every((permission) => userPermissions.includes(permission))
  }

  /**
   * Get all roles for an organization
   */
  static async getOrganizationRoles(organizationId: string) {
    return prisma.role.findMany({
      where: { organizationId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  /**
   * Get a role by ID
   */
  static async getRole(roleId: string, organizationId: string) {
    return prisma.role.findFirst({
      where: {
        id: roleId,
        organizationId,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    })
  }

  /**
   * Create a new role
   */
  static async createRole(
    organizationId: string,
    name: string,
    description: string | null,
    permissionIds: string[]
  ) {
    return prisma.role.create({
      data: {
        organizationId,
        name,
        description,
        isSystemRole: false,
        rolePermissions: {
          create: permissionIds.map((permissionId) => ({
            permissionId,
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })
  }

  /**
   * Update a role
   */
  static async updateRole(
    roleId: string,
    organizationId: string,
    name: string,
    description: string | null,
    permissionIds: string[]
  ) {
    // Check if role is system role
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    if (role.isSystemRole) {
      throw new Error('Cannot modify system role')
    }

    // Update role and permissions
    return prisma.$transaction(async (tx) => {
      // Delete existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      })

      // Update role
      const updatedRole = await tx.role.update({
        where: { id: roleId },
        data: {
          name,
          description,
          rolePermissions: {
            create: permissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      return updatedRole
    })
  }

  /**
   * Delete a role
   */
  static async deleteRole(roleId: string, organizationId: string) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    if (role.isSystemRole) {
      throw new Error('Cannot delete system role')
    }

    // Check if role is assigned to any users
    const userCount = await prisma.userRole.count({
      where: { roleId },
    })

    if (userCount > 0) {
      throw new Error('Cannot delete role that is assigned to users')
    }

    return prisma.role.delete({
      where: { id: roleId },
    })
  }

  /**
   * Get or create Admin role for an organization
   */
  static async getOrCreateAdminRole(organizationId: string) {
    // Try to find existing Admin role
    let adminRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name: 'Admin',
        isSystemRole: true,
      },
    })

    if (!adminRole) {
      // Get all permissions
      const allPermissions = await prisma.permission.findMany()
      const permissionMap = new Map<string, string>()
      for (const perm of allPermissions) {
        permissionMap.set(`${perm.resource}:${perm.action}`, perm.id)
      }

      // Get admin permissions from DEFAULT_ROLE_PERMISSIONS
      const { DEFAULT_ROLE_PERMISSIONS } = await import('@/lib/permissions/permissions')
      const adminPermissionIds = DEFAULT_ROLE_PERMISSIONS.ADMIN.map(
        (p) => permissionMap.get(p)!
      ).filter(Boolean)

      // Create Admin role
      adminRole = await prisma.role.create({
        data: {
          organizationId,
          name: 'Admin',
          description: 'Full access to all features and settings',
          isSystemRole: true,
          rolePermissions: {
            create: adminPermissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
      })
    }

    return adminRole
  }

  /**
   * Get or create Employee role for an organization
   */
  static async getOrCreateEmployeeRole(organizationId: string) {
    // Try to find existing Employee role
    let employeeRole = await prisma.role.findFirst({
      where: {
        organizationId,
        name: 'Employee',
        isSystemRole: true,
      },
    })

    if (!employeeRole) {
      // Get all permissions
      const allPermissions = await prisma.permission.findMany()
      const permissionMap = new Map<string, string>()
      for (const perm of allPermissions) {
        permissionMap.set(`${perm.resource}:${perm.action}`, perm.id)
      }

      // Get employee permissions from DEFAULT_ROLE_PERMISSIONS
      const { DEFAULT_ROLE_PERMISSIONS } = await import('@/lib/permissions/permissions')
      const employeePermissionIds = DEFAULT_ROLE_PERMISSIONS.EMPLOYEE.map(
        (p) => permissionMap.get(p)!
      ).filter(Boolean)

      // Create Employee role
      employeeRole = await prisma.role.create({
        data: {
          organizationId,
          name: 'Employee',
          description: 'Basic access to view own schedule and request swaps',
          isSystemRole: true,
          rolePermissions: {
            create: employeePermissionIds.map((permissionId) => ({
              permissionId,
            })),
          },
        },
      })
    }

    return employeeRole
  }

  /**
   * Assign a role to a user
   */
  static async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedById: string,
    organizationId: string
  ) {
    // Verify role belongs to organization
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    // Verify user belongs to organization
    const user = await prisma.user.findFirst({
      where: { id: userId, organizationId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Check if already assigned
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    })

    if (existing) {
      return existing
    }

    return prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedById,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })
  }

  /**
   * Remove a role from a user
   */
  static async removeRoleFromUser(userId: string, roleId: string, organizationId: string) {
    // Verify role belongs to organization
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    })

    if (!role) {
      throw new Error('Role not found')
    }

    if (role.isSystemRole && role.name === 'Admin') {
      // Prevent removing last admin
      const adminRole = await prisma.role.findFirst({
        where: {
          organizationId,
          name: 'Admin',
        },
        include: {
          userRoles: true,
        },
      })

      if (adminRole && adminRole.userRoles.length === 1) {
        throw new Error('Cannot remove last admin user')
      }
    }

    return prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    })
  }

  /**
   * Get all permissions (for permission selection UI)
   */
  static async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    })
  }
}
