import { NextRequest, NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  errors?: any[]
}

export class AppError extends Error {
  statusCode: number
  code?: string
  errors?: any[]

  constructor(message: string, statusCode: number = 500, code?: string, errors?: any[]) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Handle API errors and return consistent error responses
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle known AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
        errors: error.errors,
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return NextResponse.json(
      {
        message: 'Validation error',
        errors: (error as any).issues,
      },
      { status: 400 }
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : error.message

    return NextResponse.json(
      { message },
      { status: 500 }
    )
  }

  // Unknown error
  return NextResponse.json(
    { message: 'An unexpected error occurred' },
    { status: 500 }
  )
}

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
