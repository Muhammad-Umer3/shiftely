import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/db/prisma'
import { SchedulerService } from '../scheduler/scheduler.service'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export class AIService {
  /**
   * Generate AI-powered schedule suggestions
   */
  static async generateScheduleSuggestions(
    organizationId: string,
    weekStartDate: Date,
    constraints?: {
      minEmployeesPerShift?: number
      maxHoursPerEmployee?: number
      preferredShifts?: string[]
    }
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    // Get employees, availability, and leaves
    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: {
        user: true,
        slotAssignments: {
          where: {
            slot: {
              startTime: { gte: weekStartDate },
            },
          },
        },
        leaves: {
          where: {
            startDate: { lte: weekEndDate },
            endDate: { gte: weekStartDate },
          },
        },
      },
    })

    // Get existing schedule if any
    const existingSchedule = await SchedulerService.getScheduleForWeek(
      organizationId,
      weekStartDate
    )

    // Build prompt for AI
    const prompt = this.buildSchedulePrompt(employees, weekStartDate, constraints, existingSchedule)

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      })

      const systemInstruction = 'You are an expert shift scheduler. Analyze employee availability, preferences, and business constraints to suggest an optimal weekly schedule. Return your suggestions in JSON format.'
      
      const fullPrompt = `${systemInstruction}\n\n${prompt}`

      const result = await model.generateContent(fullPrompt)
      const responseText = result.response.text()
      const response = JSON.parse(responseText || '{}')
      
      return this.parseAISuggestions(response, employees)
    } catch (error) {
      console.error('AI service error:', error)
      throw new Error('Failed to generate AI suggestions')
    }
  }

  /**
   * Generate schedule suggestions from user prompt for an existing schedule
   */
  static async generateScheduleSuggestionsFromPrompt(
    organizationId: string,
    weekStartDate: Date,
    userPrompt: string,
    existingSchedule: any,
    constraints?: {
      minEmployeesPerShift?: number
      maxHoursPerEmployee?: number
      preferredShifts?: string[]
    }
  ) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: {
        user: true,
        slotAssignments: {
          where: { slot: { startTime: { gte: weekStartDate } } },
        },
        leaves: {
          where: {
            startDate: { lte: weekEndDate },
            endDate: { gte: weekStartDate },
          },
        },
      },
    })

    const assignedIds = new Set<string>()
    existingSchedule?.slots?.forEach((slot: any) => {
      slot.assignments?.forEach((a: any) => {
        if (a.employeeId) assignedIds.add(a.employeeId)
      })
    })
    const filteredEmployees =
      assignedIds.size > 0
        ? employees.filter((e) => assignedIds.has(e.id))
        : employees

    const basePrompt = this.buildSchedulePrompt(
      filteredEmployees,
      weekStartDate,
      constraints,
      existingSchedule
    )
    const fullUserPrompt = userPrompt.trim()
      ? `${userPrompt}\n\n${basePrompt}`
      : basePrompt

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      })

      const systemInstruction =
        'You are an expert shift scheduler. The user may provide specific instructions or constraints. Analyze employee availability and the existing schedule to suggest shifts. Return JSON with suggestions array and summary.'
      const prompt = `${systemInstruction}\n\n${fullUserPrompt}`

      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      const response = JSON.parse(responseText || '{}')

      return this.parseAISuggestions(response, filteredEmployees)
    } catch (error) {
      console.error('AI suggest from prompt error:', error)
      throw new Error('Failed to generate suggestions')
    }
  }

  /**
   * Recommend employee for an open shift
   */
  static async recommendEmployeeForShift(
    organizationId: string,
    shiftStartTime: Date,
    shiftEndTime: Date,
    position?: string
  ) {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback to rule-based recommendation
      return this.ruleBasedRecommendation(organizationId, shiftStartTime, shiftEndTime, position)
    }

    const employees = await prisma.employee.findMany({
      where: { organizationId },
      include: {
        user: true,
        slotAssignments: {
          where: {
            slot: {
              startTime: {
                gte: new Date(shiftStartTime.getTime() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
    })

    const prompt = `Given the following employees and their availability, recommend the best employee for a shift:
    
Shift: ${shiftStartTime.toISOString()} to ${shiftEndTime.toISOString()}
Position: ${position || 'Any'}

Employees:
${employees
  .map(
    (emp) =>
      `- ${emp.user.name || emp.user.email} (Role: ${emp.roleType || 'N/A'}, Recent shifts: ${emp.slotAssignments.length})`
  )
  .join('\n')}

Return JSON: { "recommendedEmployeeId": "id", "reason": "explanation" }`

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.5,
          responseMimeType: 'application/json',
        },
      })

      const systemInstruction = 'You are a shift scheduling assistant. Recommend the best employee for a shift based on availability, workload, and skills.'
      const fullPrompt = `${systemInstruction}\n\n${prompt}`

      const result = await model.generateContent(fullPrompt)
      const responseText = result.response.text()
      const response = JSON.parse(responseText || '{}')
      
      return {
        employeeId: response.recommendedEmployeeId,
        reason: response.reason || 'AI recommendation',
      }
    } catch (error) {
      console.error('AI recommendation error:', error)
      return this.ruleBasedRecommendation(organizationId, shiftStartTime, shiftEndTime, position)
    }
  }

  /**
   * Rule-based fallback recommendation
   */
  private static async ruleBasedRecommendation(
    organizationId: string,
    shiftStartTime: Date,
    shiftEndTime: Date,
    position?: string
  ) {
    const employees = await prisma.employee.findMany({
      where: {
        organizationId,
        ...(position && { roleType: position }),
      },
      include: {
        user: true,
        slotAssignments: {
          where: {
            slot: {
              startTime: {
                gte: new Date(shiftStartTime.getTime() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
        },
      },
    })

    const sorted = employees.sort((a, b) => a.slotAssignments.length - b.slotAssignments.length)
    return {
      employeeId: sorted[0]?.id || null,
      reason: 'Least scheduled this week',
    }
  }

  /**
   * Build prompt for schedule optimization
   */
  private static buildSchedulePrompt(
    employees: any[],
    weekStartDate: Date,
    constraints?: any,
    existingSchedule?: any
  ) {
    return `Create an optimal weekly schedule starting ${weekStartDate.toISOString()}.

Employees:
${employees
  .map((emp) => {
    const leavesStr =
      emp.leaves?.length > 0
        ? ` UNAVAILABLE (on leave): ${emp.leaves.map((l: { startDate: Date; endDate: Date; type: string }) => `${l.startDate.toISOString().slice(0, 10)} to ${l.endDate.toISOString().slice(0, 10)} (${l.type})`).join('; ')}`
        : ''
    return `- ${emp.user.name || emp.user.email} (ID: ${emp.id}, Role: ${emp.roleType || 'Any'}, Availability: ${JSON.stringify(emp.availabilityTemplate || {})}${leavesStr})`
  })
  .join('\n')}

IMPORTANT: Do NOT assign shifts to employees who are on leave during that period.

Constraints:
- Minimum employees per shift: ${constraints?.minEmployeesPerShift || 2}
- Maximum hours per employee: ${constraints?.maxHoursPerEmployee || 40}
${existingSchedule ? `- Existing slots: ${existingSchedule.slots?.length ?? 0}` : ''}

Return JSON with suggested shifts:
{
  "suggestions": [
    {
      "employeeId": "id",
      "startTime": "ISO date string",
      "endTime": "ISO date string",
      "position": "role type",
      "reason": "why this assignment"
    }
  ],
  "summary": "brief explanation of the schedule"
}`
  }

  /**
   * Parse AI suggestions into usable format
   */
  private static parseAISuggestions(response: any, employees: any[]) {
    const suggestions = response.suggestions || []
    const employeeMap = new Map(employees.map((e) => [e.id, e]))

    return {
      suggestions: suggestions
        .filter((s: any) => employeeMap.has(s.employeeId))
        .map((s: any) => ({
          employeeId: s.employeeId,
          employeeName: employeeMap.get(s.employeeId)?.user.name || employeeMap.get(s.employeeId)?.user.email,
          startTime: new Date(s.startTime),
          endTime: new Date(s.endTime),
          position: s.position || null,
          reason: s.reason || 'AI suggestion',
        })),
      summary: response.summary || 'AI-generated schedule suggestions',
    }
  }
}
