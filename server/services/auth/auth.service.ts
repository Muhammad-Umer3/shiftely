import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PermissionService } from '@/server/services/permissions/permission.service'

export class AuthService {
  /**
   * Generate a secure random token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * Register a new user and organization
   */
  static async register(
    email: string,
    password: string,
    name: string,
    organizationName: string
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization with 14-day Pro trial
      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          subscriptionTier: 'FREE',
          trialEndsAt,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: 'ADMIN',
          organizationId: organization.id,
          emailVerified: false,
        },
      })

      // Get or create Admin role for the organization (must use tx - org not committed yet)
      const adminRole = await PermissionService.getOrCreateAdminRole(
        organization.id,
        tx
      )

      // Assign admin role to user
      await tx.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
          assignedById: user.id,
        },
      })

      // Create verification token
      const verificationToken = this.generateToken()
      await tx.verificationToken.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      })

      return { user, organization, verificationToken }
    })

    return result
  }

  /**
   * Create password reset token
   */
  static async createPasswordResetToken(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists
      return null
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Create new reset token
    const token = this.generateToken()
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    return { user, token }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token')
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      })

      // Delete reset token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
    })

    return resetToken.user
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired verification token')
    }

    await prisma.$transaction(async (tx) => {
      // Mark email as verified
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      })

      // Delete verification token
      await tx.verificationToken.delete({
        where: { id: verificationToken.id },
      })
    })

    return verificationToken.user
  }

  /**
   * Create new verification token for user
   */
  static async createVerificationToken(userId: string) {
    // Delete any existing tokens
    await prisma.verificationToken.deleteMany({
      where: { userId },
    })

    const token = this.generateToken()
    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return token
  }
}
