import { Resend } from 'resend'
import { prisma } from '@/lib/db/prisma'
import { format } from 'date-fns'
import { SmsService } from '../sms/sms.service'

const resend = new Resend(process.env.RESEND_API_KEY)

export class NotificationService {
  /**
   * Send email notification
   */
  static async sendEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email')
      return
    }

    try {
      await resend.emails.send({
        from: 'Shiftely <noreply@shiftely.com>',
        to,
        subject,
        html,
      })
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }

  /**
   * Create in-app notification
   */
  static async createNotification(
    userId: string,
    type: string,
    message: string,
    metadata?: Record<string, any>
  ) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        metadata: metadata || {},
      },
    })
  }

  /**
   * Notify employees of schedule changes
   */
  static async notifyScheduleChange(
    organizationId: string,
    scheduleId: string,
    changeType: 'created' | 'updated' | 'published'
  ) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
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

    if (!schedule) return

    const affectedEmployees = new Map<string, any>()

    schedule.slots.forEach((slot) => {
      slot.assignments.forEach((a) => {
        if (a.employee) {
          const emp = a.employee
          if (!affectedEmployees.has(emp.userId)) {
            affectedEmployees.set(emp.userId, {
              user: emp.user,
              shifts: [],
            })
          }
          affectedEmployees.get(emp.userId).shifts.push({ ...slot, employee: emp })
        }
      })
    })

    // Send notifications to each affected employee
    for (const [userId, data] of affectedEmployees) {
      const message = this.getScheduleChangeMessage(changeType, data.shifts)
      
      // In-app notification
      await this.createNotification(userId, 'schedule_change', message, {
        scheduleId,
        changeType,
      })

      // Email notification
      if (data.user.email) {
        const emailHtml = this.buildScheduleChangeEmail(changeType, data.shifts)
        await this.sendEmail(
          data.user.email,
          `Schedule ${changeType === 'published' ? 'Published' : 'Updated'}`,
          emailHtml
        )
      }
    }
  }

  /**
   * Notify only employees whose shifts changed when publishing
   */
  static async notifySchedulePublishWithChanges(
    scheduleId: string,
    organizationId: string,
    previousSnapshot?: Record<string, { assignments: { employeeId: string | null }[] }>,
    currentSnapshot?: Record<string, { assignments: { employeeId: string | null }[]; startTime: string; endTime: string; position: string | null }>
  ) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        slots: {
          include: {
            assignments: {
              include: {
                employee: { include: { user: true } },
              },
            },
          },
        },
      },
    })

    if (!schedule) return

    const changedUserIds = new Set<string>()
    const prev = previousSnapshot ?? {}
    const curr = currentSnapshot ?? {}

    const allSlotIds = new Set([...Object.keys(prev), ...Object.keys(curr)])
    for (const slotId of allSlotIds) {
      const prevAssignments = prev[slotId]?.assignments ?? []
      const currAssignments = curr[slotId]?.assignments ?? []
      const prevEmployeeIds = new Set(prevAssignments.map((a) => a.employeeId).filter(Boolean) as string[])
      const currEmployeeIds = new Set(currAssignments.map((a) => a.employeeId).filter(Boolean) as string[])
      const allEmpIds = new Set([...prevEmployeeIds, ...currEmployeeIds])
      for (const empId of allEmpIds) {
        if (prevEmployeeIds.has(empId) !== currEmployeeIds.has(empId)) {
          const emp = await prisma.employee.findUnique({ where: { id: empId }, select: { userId: true } })
          if (emp) changedUserIds.add(emp.userId)
        }
      }
    }

    const affectedEmployees = new Map<string, { user: any; shifts: any[] }>()
    schedule.slots.forEach((slot) => {
      slot.assignments.forEach((a) => {
        if (a.employee && changedUserIds.has(a.employee.userId)) {
          const emp = a.employee
          if (!affectedEmployees.has(emp.userId)) {
            affectedEmployees.set(emp.userId, { user: emp.user, shifts: [] })
          }
          affectedEmployees.get(emp.userId)!.shifts.push({ ...slot, employee: emp })
        }
      })
    })
    for (const userId of changedUserIds) {
      if (affectedEmployees.has(userId)) continue
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) affectedEmployees.set(userId, { user, shifts: [] })
    }

    for (const [userId, data] of affectedEmployees) {
      const message = data.shifts.length > 0
        ? this.getScheduleChangeMessage('published', data.shifts)
        : 'Your schedule has been published. Some of your shifts may have been changed or removed.'
      await this.createNotification(userId, 'schedule_change', message, { scheduleId, changeType: 'published' })
      if (data.user.email) {
        const emailHtml = data.shifts.length > 0
          ? this.buildScheduleChangeEmail('published', data.shifts)
          : `<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h2>Schedule Published</h2><p>Your schedule has been published. Some of your shifts may have been changed or removed. Please check the app for details.</p></body></html>`
        await this.sendEmail(data.user.email, 'Schedule Published', emailHtml)
      }
      if (data.user.phone) {
        const smsText = data.shifts.length > 0
          ? `Shiftely: Your schedule was published with ${data.shifts.length} shift(s). Check the app for details.`
          : 'Shiftely: Your schedule was published. Check the app for details.'
        await SmsService.sendSms(data.user.phone, smsText)
      }
    }
  }

  /**
   * Send daily schedule email
   */
  static async sendDailySchedule(employeeId: string, date: Date) {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: true,
        slotAssignments: {
          where: {
            slot: {
              startTime: {
                gte: dayStart,
                lt: dayEnd,
              },
            },
          },
          include: {
            slot: true,
          },
        },
      },
    })

    if (!employee || !employee.user.email) return

    const shifts = employee.slotAssignments.map((sa) => sa.slot)
    const emailHtml = this.buildDailyScheduleEmail(shifts, date)
    await this.sendEmail(
      employee.user.email,
      `Your Schedule for ${format(date, 'MMMM d, yyyy')}`,
      emailHtml
    )
  }

  /**
   * Notify of slot swap request
   */
  static async notifySlotSwap(
    swapId: string,
    notificationType: 'requested' | 'approved' | 'rejected'
  ) {
    const swap = await prisma.slotSwap.findUnique({
      where: { id: swapId },
      include: {
        slot: {
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
        requester: true,
        targetEmployee: true,
      },
    })

    if (!swap) return

    const assignedEmployee = swap.slot.assignments.find((a) => a.employeeId)?.employee
    const targetUser = swap.targetEmployee || assignedEmployee?.user
    if (!targetUser) return

    const message = this.getShiftSwapMessage(notificationType, swap)
    
    await this.createNotification(targetUser.id, 'shift_swap', message, {
      swapId,
      notificationType,
    })

    if (targetUser.email) {
      const emailHtml = this.buildShiftSwapEmail(notificationType, swap)
      await this.sendEmail(
        targetUser.email,
        `Shift Swap ${notificationType === 'requested' ? 'Request' : 'Update'}`,
        emailHtml
      )
    }

    if (targetUser.phone) {
      const slot = swap.slot
      const shiftInfo = slot
        ? `${format(new Date(slot.startTime), 'MMM d')} ${format(new Date(slot.startTime), 'h:mm a')}`
        : ''
      const smsText =
        notificationType === 'requested'
          ? `Shiftely: ${swap.requester.name || swap.requester.email} requested to swap ${shiftInfo} with you.`
          : notificationType === 'approved'
          ? 'Shiftely: Your shift swap was approved.'
          : 'Shiftely: Your shift swap was rejected.'
      await SmsService.sendSms(targetUser.phone, smsText)
    }
  }

  /** @deprecated Use notifySlotSwap */
  static async notifyShiftSwap(swapId: string, notificationType: 'requested' | 'approved' | 'rejected') {
    return this.notifySlotSwap(swapId, notificationType)
  }

  /**
   * Build schedule change message
   */
  private static getScheduleChangeMessage(changeType: string, shifts: any[]): string {
    if (changeType === 'published') {
      return `Your schedule has been published with ${shifts.length} shift(s) this week.`
    }
    return `Your schedule has been updated. You have ${shifts.length} shift(s) scheduled.`
  }

  /**
   * Build schedule change email HTML
   */
  private static buildScheduleChangeEmail(changeType: string, shifts: any[]): string {
    const shiftsHtml = shifts
      .map(
        (shift) => `
      <tr>
        <td>${format(new Date(shift.startTime), 'MMM d, yyyy')}</td>
        <td>${format(new Date(shift.startTime), 'h:mm a')} - ${format(new Date(shift.endTime), 'h:mm a')}</td>
        <td>${shift.position || 'Shift'}</td>
      </tr>
    `
      )
      .join('')

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Schedule ${changeType === 'published' ? 'Published' : 'Updated'}</h2>
          <p>Your schedule has been ${changeType === 'published' ? 'published' : 'updated'}.</p>
          <table border="1" cellpadding="10" style="border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${shiftsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `
  }

  /**
   * Build daily schedule email HTML
   */
  private static buildDailyScheduleEmail(shifts: any[], date: Date): string {
    if (shifts.length === 0) {
      return `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Your Schedule for ${format(date, 'MMMM d, yyyy')}</h2>
            <p>You have no shifts scheduled for today.</p>
          </body>
        </html>
      `
    }

    const shiftsHtml = shifts
      .map(
        (shift) => `
      <tr>
        <td>${format(new Date(shift.startTime), 'h:mm a')} - ${format(new Date(shift.endTime), 'h:mm a')}</td>
        <td>${shift.position || 'Shift'}</td>
      </tr>
    `
      )
      .join('')

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Schedule for ${format(date, 'MMMM d, yyyy')}</h2>
          <table border="1" cellpadding="10" style="border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th>Time</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              ${shiftsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `
  }

  /**
   * Get shift swap message
   */
  private static getShiftSwapMessage(notificationType: string, swap: any): string {
    if (notificationType === 'requested') {
      return `${swap.requester.name || swap.requester.email} requested to swap a shift with you.`
    }
    if (notificationType === 'approved') {
      return `Your shift swap request has been approved.`
    }
    return `Your shift swap request has been rejected.`
  }

  /**
   * Build shift swap email HTML
   */
  private static buildShiftSwapEmail(notificationType: string, swap: any): string {
    const slot = swap.slot
    const shiftDate = format(new Date(slot.startTime), 'MMM d, yyyy')
    const shiftTime = `${format(new Date(slot.startTime), 'h:mm a')} - ${format(new Date(slot.endTime), 'h:mm a')}`

    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Shift Swap ${notificationType === 'requested' ? 'Request' : 'Update'}</h2>
          <p>
            ${notificationType === 'requested' 
              ? `${swap.requester.name || swap.requester.email} requested to swap a shift with you.` 
              : notificationType === 'approved'
              ? 'Your shift swap request has been approved.'
              : 'Your shift swap request has been rejected.'}
          </p>
          <p><strong>Shift:</strong> ${shiftDate} at ${shiftTime}</p>
        </body>
      </html>
    `
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(email: string, name: string, verificationUrl: string) {
    const html = this.buildWelcomeEmail(name, verificationUrl)
    await this.sendEmail(email, 'Welcome to Shiftely!', html)
  }

  /**
   * Build welcome email HTML
   */
  private static buildWelcomeEmail(name: string, verificationUrl: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Shiftely, ${name}!</h2>
          <p>Thank you for signing up. We're excited to help you manage your shift scheduling.</p>
          <p>To get started, please verify your email address by clicking the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </body>
      </html>
    `
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string, resetUrl: string) {
    const html = this.buildPasswordResetEmail(resetUrl)
    await this.sendEmail(email, 'Reset Your Password', html)
  }

  /**
   * Build password reset email HTML
   */
  private static buildPasswordResetEmail(resetUrl: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </body>
      </html>
    `
  }

  /**
   * Send email verification email
   */
  static async sendVerificationEmail(email: string, name: string, verificationUrl: string) {
    const html = this.buildVerificationEmail(name, verificationUrl)
    await this.sendEmail(email, 'Verify Your Email Address', html)
  }

  /**
   * Build verification email HTML
   */
  private static buildVerificationEmail(name: string, verificationUrl: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Verify Your Email Address</h2>
          <p>Hi ${name},</p>
          <p>Please verify your email address by clicking the link below:</p>
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </body>
      </html>
    `
  }

  /**
   * Send invitation email
   */
  static async sendInvitationEmail(
    email: string,
    inviterName: string,
    organizationName: string,
    inviteUrl: string
  ) {
    const html = this.buildInvitationEmail(inviterName, organizationName, inviteUrl)
    await this.sendEmail(email, `You've been invited to join ${organizationName} on Shiftely`, html)
  }

  /**
   * Build invitation email HTML
   */
  private static buildInvitationEmail(
    inviterName: string,
    organizationName: string,
    inviteUrl: string
  ): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>You've been invited!</h2>
          <p>Hi there,</p>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Shiftely.</p>
          <p>Click the link below to accept the invitation and create your account:</p>
          <p style="margin: 20px 0;">
            <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${inviteUrl}</p>
          <p>This invitation will expire in 7 days.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </body>
      </html>
    `
  }
}
